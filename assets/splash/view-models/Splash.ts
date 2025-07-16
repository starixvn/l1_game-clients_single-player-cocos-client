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
        console.log('[Splash] Component loaded, initializing...');
        appManager.init();

        this.disableAllNodeSplash();
        this.initUIListeners();

        this.enableMainSplashScreen();
        this.handleAuthorization();
        this.loadIconTop();
        this.loadIconBottom();
        console.log('[Splash] Initialization completed');
    }

    private initUIListeners() {
        console.log('[Splash] Initializing UI listeners');
        uiManager.emitterListener(InternalEvents.MICROSITE_BACK_TO_LOBBY, this.onMicrositeBackToLobby.bind(this), this);
        uiManager.emitterListener(InternalEvents.MICROSITE_OPEN_GAME_BACK_FROM_LOBBY, this.openGameFromMicroGame.bind(this), this);
        console.log('[Splash] UI listeners initialized');
    }

    private clearUIListeners() {
        console.log('[Splash] Clearing UI listeners');
        uiManager.removeListenersWithTarget(this);
    }

    protected onDestroy(): void {
        console.log('[Splash] Component destroying');
        this.clearUIListeners();
    }

    private async handleSplashScene(): Promise<void> {
        console.log('[Splash] Handling splash scene...');
        const urlParams = appManager.urlParams;
        const gameId = +urlParams.get("gameId");
        const params = urlParams.get("params");
        console.log(`[Splash] URL params - gameId: ${gameId}, params: ${params}`);

        // Handle from standalone micro-site game
        if (params) {
            console.log('[Splash] Handling standalone micro-site game');
            // clear micro-site game id when returning from session
            SessionManager.removeMicrositeGameId();

            if (isGatewayGame(gameId) && this.handleGatewayGame(gameId)) {
                console.log('[Splash] Gateway game handled, returning');
                return;
            }
            console.log('[Splash] Loading to lobby or direct game from standalone micro-site');
            this.loadToLobbyOrDirectGame();
            return;
        }

        // Handle SSO game launch
        const isSSOGameLaunch = urlParams.has("token") && urlParams.has("gameId") && gameId !== 0;
        console.log(`[Splash] SSO game launch detected: ${isSSOGameLaunch}`);
        if (isSSOGameLaunch) {
            if (isGatewayGame(gameId) && this.handleGatewayGame(gameId)) {
                console.log('[Splash] SSO gateway game handled, returning');
                return;
            }
            if (this.isMicrositeGame(gameId)) {
                console.log(`[Splash] Opening microsite game at Splash: ${gameId}`);
                cc.log("Open game microsite at Splash ", gameId);
                await this.enableMicrositeGameIframe(gameId);
                appManager.clearSSOGameId();
                return;
            }
        }

        if (this.handleOpenDummyRoom(isSSOGameLaunch)) {
            console.log('[Splash] Dummy room handled, returning');
            return;
        }

        // Handle reload from micro-site game
        const micrositeGameId = +SessionManager.getMicrositeGameId();
        console.log(`[Splash] Microsite game ID from session: ${micrositeGameId}`);
        if (!urlParams.has("token") && micrositeGameId > 0) {
            console.log(`[Splash] Reloading microsite game: ${micrositeGameId}`);
            await this.enableMicrositeGameIframe(micrositeGameId);
            return;
        }

        // Default: load to lobby or direct game
        console.log('[Splash] Default path: loading to lobby or direct game');
        this.loadToLobbyOrDirectGame();
    }

    handleOpenDummyRoom(isSSOToGame) {
        console.log(`[Splash] Checking dummy room - isSSOToGame: ${isSSOToGame}`);
        const ssoDirectModeGameId =
            isSSOToGame && appManager.isDirectMode && isMiniGameByGameId(appManager.directGameId) ? appManager.directGameId : -1;
        const dummyRoomStorage = SessionManager.getDummyRoomStorage();
        const dummyRoomGameId = ssoDirectModeGameId > 0 ? ssoDirectModeGameId : dummyRoomStorage ? dummyRoomStorage.gameId : -1;
        console.log(`[Splash] Dummy room game ID: ${dummyRoomGameId}`);
        if (dummyRoomGameId > 0) {
            console.log(`[Splash] Opening dummy room for game: ${dummyRoomGameId}`);
            SessionManager.storeDummyRoom(dummyRoomGameId);
            cc.director.loadScene("dummy_room");
            return true;
        }

        console.log('[Splash] No dummy room to open');
        return false;
    }

    async onMicrositeBackToLobby() {
        console.log('[Splash] Microsite back to lobby requested');
        await this.handleBackFromMicrositeGame();
        this.loadToLobbyOrDirectGame();
    }

    loadToLobbyOrDirectGame() {
        console.log('[Splash] Loading to lobby or direct game');
        const mainSplash = this.nodeMainSplash.getComponent(MainSplash);
        mainSplash.loadToLobbyOrDirectGame();
    }

    private async handleBackFromMicrositeGame() {
        console.log('[Splash] Handling back from microsite game');
        this.enableMainSplashScreen();
        await appManager.initNotificationService();
        console.log('[Splash] Back from microsite game handled');
    }

    private async handleAuthorization() {
        console.log('[Splash] Starting authorization process');
        await initGameConfiguration();
        console.log(`[Splash] App authorized: ${appManager.authorized}`);
        if (!appManager.authorized) {
            console.log('[Splash] Not authorized, attempting SSO authorization');
            await appManager.ssoAndAuthorize();
            console.log(`[Splash] After SSO authorization: ${appManager.authorized}`);
            if (!appManager.authorized) {
                if (!appManager.autoGenerateNickname) {
                    console.log('[Splash] Showing sign name dialog');
                    this.showSignName();
                } else {
                    console.log('[Splash] Auto-generating nickname');
                }
                return;
            }
        }

        console.log('[Splash] Authorization successful, handling splash scene');
        this.handleSplashScene();
    }

    async showSignName() {
        console.log('[Splash] Loading sign name prefab');
        const prefab = await GameUtils.loadResource("prefabs/SignName");

        const node = cc.instantiate(prefab);
        const signName = node.getComponent("SignName");
        signName.init(this.handleSignName.bind(this));

        this.nodeDialog.addChild(node);
        console.log('[Splash] Sign name dialog added to scene');
    }

    handleSignName(response) {
        console.log('[Splash] Sign name response received:', response);
        if (response.authorized) {
            console.log('[Splash] Sign name authorization successful');
            appManager.authorized = true;
            userManager.updateUser(response.user);
            this.serviceAuthorized(response.authorized);
        } else {
            console.log(`[Splash] Sign name authorization failed with error code: ${response.errorCode}`);
            const errorCode = response.errorCode;
            const text = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
            this.showNotice(text);
        }
    }

    async showNotice(text: string) {
        console.log(`[Splash] Showing notice: ${text}`);
        const data = {
            text: text,
            isInfo: false
        };
        uiManager.emitter.emit(InternalEvents.NOTICE, { data });
    }

    serviceAuthorized(Authorized) {
        console.log(`[Splash] Service authorization status: ${Authorized}`);
        if (!Authorized) {
            console.log('[Splash] Service not authorized, showing sign name');
            this.showSignName();
        } else {
            console.log('[Splash] Service authorized, handling splash scene');
            this.handleSplashScene();
        }
    }

    private async enableMicrositeGameIframe(gameId) {
        console.log(`[Splash] Enabling microsite game iframe for game: ${gameId}`);
        const healthy = await GameUtils.healthCheckMicrositeGame(gameId);
        console.log(`[Splash] Microsite game health check result: ${healthy}`);
        if (!healthy) {
            console.log('[Splash] Microsite game unhealthy, loading to lobby instead');
            this.loadToLobbyOrDirectGame();
            return;
        }
        this.activeMicrositeGameNode();
        const urlParams = appManager.urlParams;
        if (urlParams.has("op")) {
            const operator = urlParams.get("op");
            console.log(`[Splash] Storing operator: ${operator}`);
            SessionManager.storeOperator(operator);
        }

        if (urlParams.has("gameId")) {
            const gameId = +urlParams.get("gameId");
            console.log(`[Splash] Storing microsite game ID: ${gameId}`);
            SessionManager.clearStorageMicroSite(true);
            SessionManager.storeMicrositeGameId(gameId);
        }
        const iframe = cc.instantiate(this.prfMicrositeGame);
        this.nodeMicrositeGame.addChild(iframe);
        console.log('[Splash] Microsite game iframe added to scene');
    }

    private activeMicrositeGameNode() {
        console.log('[Splash] Activating microsite game node');
        this.nodeMicrositeGame.active = true;
        this.nodeMainSplash.active = false;
    }

    private enableMainSplashScreen() {
        console.log('[Splash] Enabling main splash screen');
        GameUtils.setCanvasVisibilty(true);
        this.nodeMainSplash.active = true;
        this.nodeMicrositeGame.destroyAllChildren();
        this.nodeMicrositeGame.active = false;
    }

    isMicrositeGame(gameId) {
        const gameConfiguration = getGameConfiguration(gameId);
        const isMicrosite = GameUtils.isMicroSite(gameConfiguration);
        console.log(`[Splash] Checking if game ${gameId} is microsite: ${isMicrosite}`);
        return isMicrosite;
    }

    private async openGameFromMicroGame(gameId: number) {
        console.log(`[Splash] Opening game from micro game: ${gameId}`);
        SessionManager.storeInRoomGameId(gameId);

        await this.handleBackFromMicrositeGame();
    }

    private disableAllNodeSplash() {
        console.log('[Splash] Disabling all splash nodes');
        this.nodeMainSplash.active = false;
        this.nodeMicrositeGame.active = false;
    }

    private loadIconTop() {
        console.log('[Splash] Loading top icon (placeholder)');
        // handle after
    }

    private loadIconBottom() {
        console.log('[Splash] Loading bottom icon (placeholder)');
        // handle after
    }

    private handleGatewayGame(gameId: number): boolean {
        console.log(`[Splash] Handling gateway game: ${gameId}`);
        cc.log("Open gateway at Splash");
        const gameConfiguration = getGameConfiguration(gameId);
        const mainId = gameConfiguration.gateway?.id;
        console.log(`[Splash] Gateway main ID: ${mainId}`);
        if (mainId === gameId) {
            console.log(`[Splash] Opening socket gateway game: ${mainId}`);
            GameUtils.openSocketGatewayGame(mainId, this.socketIOControler);
            appManager.clearSSOGameId();
            return true;
        }
        console.log('[Splash] Not a gateway game or main ID mismatch');
        return false;
    }
}
