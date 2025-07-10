import { lazyInject } from "../../Application";
import * as SessionManager from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import { userManager } from "../../common/user/UserManager";
import NoticeUtil from "../../common/utils/NoticeUtil";
import {
    getGameConfiguration,
    initialize as initGameConfiguration,
    isGatewayGame,
    isMiniGameByGameId
} from "../../configs/GameConfigurations";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import SocketIOController from "../../SocketIOController";
import MainSplash from "./MainSplash";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Splash extends cc.Component {
    @property(cc.Node)
    nodeMainSplash: cc.Node = null;

    @property(cc.Node)
    nodeMicrositeGame: cc.Node = null;

    @property(cc.Prefab)
    prfMicrositeGame: cc.Prefab = null;

    @property(cc.Node)
    nodeDialog: cc.Node = null;

    @property(cc.Sprite)
    iconTop: cc.Sprite = null;

    @property(cc.Sprite)
    iconBottom: cc.Sprite = null;

    @lazyInject(SocketIOController)
    private readonly socketIOControler: SocketIOController;

    private readonly href = `${window.location.origin}/splash-resources`;

    protected onLoad(): void {
        console.log("🎮 [Splash] ===== onLoad started =====");
        console.log("🎮 [Splash] Component properties:", {
            hasMainSplash: !!this.nodeMainSplash,
            hasMicrositeGame: !!this.nodeMicrositeGame,
            hasMicrositePrefab: !!this.prfMicrositeGame,
            hasDialog: !!this.nodeDialog,
            hasIconTop: !!this.iconTop,
            hasIconBottom: !!this.iconBottom
        });

        const startTime = Date.now();
        console.log("🎮 [Splash] Starting AppManager initialization...");
        appManager.init();
        console.log("🎮 [Splash] AppManager initialization completed");

        console.log("🎮 [Splash] Disabling all splash nodes...");
        this.disableAllNodeSplash();

        console.log("🎮 [Splash] Initializing UI listeners...");
        this.initUIListeners();

        console.log("🎮 [Splash] Enabling main splash screen...");
        this.enableMainSplashScreen();

        console.log("🎮 [Splash] Starting authorization process...");
        this.handleAuthorization();

        console.log("🎮 [Splash] Loading operator icons...");
        this.loadIconTop();
        this.loadIconBottom();

        const endTime = Date.now();
        console.log("🎮 [Splash] ===== onLoad completed in", (endTime - startTime), "ms =====");
    }

    private initUIListeners(): void {
        console.log("🎮 [Splash] Setting up UI event listeners...");

        uiManager.emitterListener(InternalEvents.MICROSITE_OPEN_GAME_BACK_FROM_LOBBY, this.openGameFromMicroGame.bind(this), this);
        uiManager.emitterListener(InternalEvents.MICROSITE_BACK_TO_LOBBY, this.onMicrositeBackToLobby.bind(this), this);

        console.log("🎮 [Splash] UI event listeners configured successfully");
    }

    private clearUIListeners() {
        console.log("🎮 [Splash] Clearing UI listeners");
        uiManager.removeListenersWithTarget(this);
    }

    protected onDestroy(): void {
        console.log("🎮 [Splash] onDestroy called");
        this.clearUIListeners();
    }

    private async handleSplashScene(): Promise<void> {
        console.log("🎮 [Splash] ===== handleSplashScene started =====");
        const startTime = Date.now();

        const urlParams = appManager.urlParams;
        const gameId = +urlParams.get("gameId");
        const params = urlParams.get("params");
        const token = urlParams.get("token");
        const ref = urlParams.get("ref");

        console.log("🎮 [Splash] URL parameters analysis:", {
            gameId,
            hasParams: !!params,
            hasToken: !!token,
            ref,
            isDirectMode: appManager.isDirectMode,
            isAppMode: appManager.isAppMode,
            isPFF: appManager.isPFF
        });

        // Handle from standalone micro-site game
        if (params) {
            console.log("🎮 [Splash] 🚀 PARAMS detected - handling standalone micro-site game");
            console.log("🎮 [Splash] Clearing micro-site game ID from storage");
            SessionManager.removeMicrositeGameId();

            if (isGatewayGame(gameId)) {
                console.log("🎮 [Splash] 🔌 Gateway game detected, attempting to handle...");
                if (this.handleGatewayGame(gameId)) {
                    console.log("🎮 [Splash] ✅ Gateway game handled successfully");
                    return;
                } else {
                    console.log("🎮 [Splash] ❌ Gateway game handling failed, falling back to lobby");
                }
            }

            console.log("🎮 [Splash] Loading to lobby or direct game from params flow");
            this.loadToLobbyOrDirectGame();
            return;
        }

        // Handle SSO game launch
        const isSSOGameLaunch = urlParams.has("token") && urlParams.has("gameId") && gameId !== 0;
        console.log("🎮 [Splash] 🔐 SSO game launch check:", {
            isSSOGameLaunch,
            hasToken: urlParams.has("token"),
            hasGameId: urlParams.has("gameId"),
            gameId,
            isGameIdValid: gameId !== 0
        });

        if (isSSOGameLaunch) {
            console.log("🎮 [Splash] 🚀 Processing SSO game launch for game ID:", gameId);

            if (isGatewayGame(gameId)) {
                console.log("🎮 [Splash] 🔌 Gateway game detected in SSO launch, attempting to handle...");
                if (this.handleGatewayGame(gameId)) {
                    console.log("🎮 [Splash] ✅ Gateway game handled successfully in SSO launch");
                    return;
                } else {
                    console.log("🎮 [Splash] ❌ Gateway game handling failed in SSO launch");
                }
            }

            if (this.isMicrositeGame(gameId)) {
                console.log("🎮 [Splash] 🌐 Microsite game detected, opening iframe for game:", gameId);
                await this.enableMicrositeGameIframe(gameId);
                console.log("🎮 [Splash] Clearing SSO game ID after microsite launch");
                appManager.clearSSOGameId();
                return;
            }

            console.log("🎮 [Splash] Game is not gateway or microsite, checking for dummy room...");
        }

        // Handle dummy room
        if (this.handleOpenDummyRoom(isSSOGameLaunch)) {
            console.log("🎮 [Splash] ✅ Dummy room handled successfully");
            return;
        }

        // Handle reload from micro-site game
        const micrositeGameId = +SessionManager.getMicrositeGameId();
        console.log("🎮 [Splash] 🔄 Microsite game reload check:", {
            micrositeGameId,
            hasToken: urlParams.has("token"),
            shouldReload: !urlParams.has("token") && micrositeGameId > 0
        });

        if (!urlParams.has("token") && micrositeGameId > 0) {
            console.log("🎮 [Splash] 🔄 Reloading microsite game from storage:", micrositeGameId);
            await this.enableMicrositeGameIframe(micrositeGameId);
            return;
        }

        // Default: load to lobby or direct game
        console.log("🎮 [Splash] 📍 Default flow: loading to lobby or direct game");
        this.loadToLobbyOrDirectGame();

        const endTime = Date.now();
        console.log("🎮 [Splash] ===== handleSplashScene completed in", (endTime - startTime), "ms =====");
    }

    handleOpenDummyRoom(isSSOToGame) {
        console.log("🎮 [Splash] ===== handleOpenDummyRoom started =====");
        console.log("🎮 [Splash] Dummy room check parameters:", {
            isSSOToGame,
            isDirectMode: appManager.isDirectMode,
            directGameId: appManager.directGameId,
            isMiniGame: isMiniGameByGameId(appManager.directGameId)
        });

        const ssoDirectModeGameId =
            isSSOToGame && appManager.isDirectMode && isMiniGameByGameId(appManager.directGameId) ? appManager.directGameId : -1;
        const dummyRoomStorage = SessionManager.getDummyRoomStorage();
        const dummyRoomGameId = ssoDirectModeGameId > 0 ? ssoDirectModeGameId : dummyRoomStorage ? dummyRoomStorage.gameId : -1;

        console.log("🎮 [Splash] Dummy room calculation:", {
            ssoDirectModeGameId,
            dummyRoomStorage: !!dummyRoomStorage,
            dummyRoomGameId,
            finalGameId: dummyRoomGameId
        });

        if (dummyRoomGameId > 0) {
            console.log("🎮 [Splash] 🎯 Opening dummy room for game:", dummyRoomGameId);
            SessionManager.storeDummyRoom(dummyRoomGameId);
            console.log("🎮 [Splash] Loading dummy_room scene...");
            cc.director.loadScene("dummy_room");
            console.log("🎮 [Splash] ===== handleOpenDummyRoom completed - dummy room opened =====");
            return true;
        }

        console.log("🎮 [Splash] ===== handleOpenDummyRoom completed - no dummy room to open =====");
        return false;
    }

    async onMicrositeBackToLobby() {
        console.log("🎮 [Splash] ===== onMicrositeBackToLobby triggered =====");
        await this.handleBackFromMicrositeGame();
        console.log("🎮 [Splash] Loading to lobby or direct game after microsite return");
        this.loadToLobbyOrDirectGame();
    }

    loadToLobbyOrDirectGame() {
        console.log("🎮 [Splash] ===== loadToLobbyOrDirectGame started =====");
        const mainSplash = this.nodeMainSplash.getComponent(MainSplash);
        if (!mainSplash) {
            console.error("🎮 [Splash] ❌ MainSplash component not found!");
            return;
        }
        console.log("🎮 [Splash] Delegating to MainSplash component...");
        mainSplash.loadToLobbyOrDirectGame();
    }

    private async handleBackFromMicrositeGame() {
        console.log("🎮 [Splash] ===== handleBackFromMicrositeGame started =====");
        console.log("🎮 [Splash] Enabling main splash screen...");
        this.enableMainSplashScreen();
        console.log("🎮 [Splash] Initializing notification service...");
        await appManager.initNotificationService();
        console.log("🎮 [Splash] ===== handleBackFromMicrositeGame completed =====");
    }

    private async handleAuthorization() {
        console.log("🎮 [Splash] ===== handleAuthorization started =====");
        const startTime = Date.now();

        console.log("🎮 [Splash] Initializing game configuration...");
        await initGameConfiguration();
        console.log("🎮 [Splash] ✅ Game configuration initialized");

        console.log("🎮 [Splash] Checking authorization status:", {
            authorized: appManager.authorized,
            autoGenerateNickname: appManager.autoGenerateNickname
        });

        if (!appManager.authorized) {
            console.log("🎮 [Splash] 🔐 Not authorized, starting SSO and authorization process...");
            await appManager.ssoAndAuthorize();
            console.log("🎮 [Splash] SSO and authorization completed, result:", appManager.authorized);

            if (!appManager.authorized) {
                if (!appManager.autoGenerateNickname) {
                    console.log("🎮 [Splash] ❌ Authorization failed, showing sign name dialog");
                    this.showSignName();
                } else {
                    console.log("🎮 [Splash] ❌ Authorization failed, auto-generate nickname enabled");
                }
                const endTime = Date.now();
                console.log("🎮 [Splash] ===== handleAuthorization completed (failed) in", (endTime - startTime), "ms =====");
                return;
            }
        } else {
            console.log("🎮 [Splash] ✅ Already authorized, proceeding to splash scene");
        }

        console.log("🎮 [Splash] Authorization successful, handling splash scene...");
        this.handleSplashScene();

        const endTime = Date.now();
        console.log("🎮 [Splash] ===== handleAuthorization completed (success) in", (endTime - startTime), "ms =====");
    }

    async showSignName() {
        console.log("🎮 [Splash] Showing sign name dialog");
        const prefab = await GameUtils.loadResource("prefabs/SignName");

        const node = cc.instantiate(prefab);
        const signName = node.getComponent("SignName");
        signName.init(this.handleSignName.bind(this));

        this.nodeDialog.addChild(node);
    }

    handleSignName(response) {
        console.log("🎮 [Splash] ===== handleSignName started =====");
        console.log("🎮 [Splash] Sign name response:", {
            authorized: response.authorized,
            hasUser: !!response.user,
            errorCode: response.errorCode
        });

        if (response.authorized) {
            console.log("🎮 [Splash] ✅ Sign name successful, updating user and proceeding");
            appManager.authorized = true;
            userManager.updateUser(response.user);
            this.serviceAuthorized(response.authorized);
        } else {
            console.log("🎮 [Splash] ❌ Sign name failed, showing error");
            const errorCode = response.errorCode;
            const text = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
            console.log("🎮 [Splash] Error details:", { errorCode, localizedText: text });
            this.showNotice(text);
        }
        console.log("🎮 [Splash] ===== handleSignName completed =====");
    }

    async showNotice(text: string) {
        console.log("🎮 [Splash] Showing notice:", text);
        const data = {
            text: text,
            isInfo: false
        };
        uiManager.emitter.emit(InternalEvents.NOTICE, { data });
    }

    serviceAuthorized(Authorized) {
        console.log("🎮 [Splash] ===== serviceAuthorized called =====");
        console.log("🎮 [Splash] Service authorization result:", Authorized);

        if (!Authorized) {
            console.log("🎮 [Splash] ❌ Service authorization failed, showing sign name");
            this.showSignName();
        } else {
            console.log("🎮 [Splash] ✅ Service authorization successful, handling splash scene");
            this.handleSplashScene();
        }
        console.log("🎮 [Splash] ===== serviceAuthorized completed =====");
    }

    private async enableMicrositeGameIframe(gameId) {
        console.log("🎮 [Splash] ===== enableMicrositeGameIframe started =====");
        const startTime = Date.now();

        console.log("🎮 [Splash] Enabling microsite game iframe for game:", gameId);
        console.log("🎮 [Splash] Performing health check for microsite game...");

        const healthy = await GameUtils.healthCheckMicrositeGame(gameId);
        console.log("🎮 [Splash] Microsite game health check result:", healthy);

        if (!healthy) {
            console.log("🎮 [Splash] ❌ Microsite game unhealthy, loading to lobby");
            this.loadToLobbyOrDirectGame();
            return;
        }

        console.log("🎮 [Splash] ✅ Microsite game healthy, activating microsite game node");
        this.activeMicrositeGameNode();

        const urlParams = appManager.urlParams;
        if (urlParams.has("op")) {
            const operator = urlParams.get("op");
            console.log("🎮 [Splash] Storing operator from URL:", operator);
            SessionManager.storeOperator(operator);
        }

        if (urlParams.has("gameId")) {
            const gameId = +urlParams.get("gameId");
            console.log("🎮 [Splash] Storing microsite game ID:", gameId);
            SessionManager.clearStorageMicroSite(true);
            SessionManager.storeMicrositeGameId(gameId);
        }

        console.log("🎮 [Splash] Creating microsite game iframe...");
        const iframe = cc.instantiate(this.prfMicrositeGame);
        this.nodeMicrositeGame.addChild(iframe);
        console.log("🎮 [Splash] ✅ Microsite game iframe created and added to scene");

        const endTime = Date.now();
        console.log("🎮 [Splash] ===== enableMicrositeGameIframe completed in", (endTime - startTime), "ms =====");
    }

    private activeMicrositeGameNode() {
        console.log("🎮 [Splash] ===== activeMicrositeGameNode called =====");
        console.log("🎮 [Splash] Activating microsite game node, deactivating main splash");
        this.nodeMicrositeGame.active = true;
        this.nodeMainSplash.active = false;
        console.log("🎮 [Splash] Node states updated:", {
            micrositeGameActive: this.nodeMicrositeGame.active,
            mainSplashActive: this.nodeMainSplash.active
        });
        console.log("🎮 [Splash] ===== activeMicrositeGameNode completed =====");
    }

    private enableMainSplashScreen() {
        console.log("🎮 [Splash] ===== enableMainSplashScreen called =====");
        console.log("🎮 [Splash] Enabling main splash screen, cleaning up microsite");
        GameUtils.setCanvasVisibilty(true);
        this.nodeMainSplash.active = true;
        this.nodeMicrositeGame.destroyAllChildren();
        this.nodeMicrositeGame.active = false;
        console.log("🎮 [Splash] Main splash screen enabled, microsite cleaned up");
        console.log("🎮 [Splash] ===== enableMainSplashScreen completed =====");
    }

    isMicrositeGame(gameId) {
        console.log("🎮 [Splash] ===== isMicrositeGame check =====");
        const gameConfiguration = getGameConfiguration(gameId);
        const isMicrosite = GameUtils.isMicroSite(gameConfiguration);
        console.log("🎮 [Splash] Microsite game check:", {
            gameId,
            hasGameConfig: !!gameConfiguration,
            isMicrosite,
            gameConfig: gameConfiguration ? {
                name: gameConfiguration.name,
                hasMicrositeConfig: !!gameConfiguration.isMicrosite
            } : null
        });
        console.log("🎮 [Splash] ===== isMicrositeGame check completed =====");
        return isMicrosite;
    }

    private async openGameFromMicroGame(gameId: number) {
        console.log("🎮 [Splash] ===== openGameFromMicroGame started =====");
        console.log("🎮 [Splash] Opening game from micro game:", gameId);
        SessionManager.storeInRoomGameId(gameId);
        console.log("🎮 [Splash] In-room game ID stored:", gameId);

        await this.handleBackFromMicrositeGame();
        console.log("🎮 [Splash] ===== openGameFromMicroGame completed =====");
    }

    private disableAllNodeSplash() {
        console.log("🎮 [Splash] ===== disableAllNodeSplash called =====");
        console.log("🎮 [Splash] Disabling all splash nodes");
        this.nodeMainSplash.active = false;
        this.nodeMicrositeGame.active = false;
        console.log("🎮 [Splash] Node states:", {
            mainSplashActive: this.nodeMainSplash.active,
            micrositeGameActive: this.nodeMicrositeGame.active
        });
        console.log("🎮 [Splash] ===== disableAllNodeSplash completed =====");
    }

    private loadIconTop() {
        console.log("🎮 [Splash] Loading top icon");
        // handle after
    }

    private loadIconBottom() {
        console.log("🎮 [Splash] Loading bottom icon");
        // handle after
    }

    private handleGatewayGame(gameId: number): boolean {
        console.log("🎮 [Splash] ===== handleGatewayGame started =====");
        console.log("🎮 [Splash] Handling gateway game:", gameId);

        const gameConfiguration = getGameConfiguration(gameId);
        const mainId = gameConfiguration.gateway?.id;
        console.log("🎮 [Splash] Gateway configuration:", {
            gameId,
            hasGameConfig: !!gameConfiguration,
            gatewayConfig: gameConfiguration?.gateway,
            mainId,
            isMainGame: mainId === gameId
        });

        if (mainId === gameId) {
            console.log("🎮 [Splash] 🔌 Opening socket gateway game:", mainId);
            GameUtils.openSocketGatewayGame(mainId, this.socketIOControler);
            appManager.clearSSOGameId();
            console.log("🎮 [Splash] ✅ Gateway game opened successfully");
            console.log("🎮 [Splash] ===== handleGatewayGame completed (success) =====");
            return true;
        }

        console.log("🎮 [Splash] ❌ Not a gateway game or main ID mismatch");
        console.log("🎮 [Splash] ===== handleGatewayGame completed (failed) =====");
        return false;
    }
}
