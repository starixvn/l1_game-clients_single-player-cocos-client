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
import ChunkedFontLoader, { FontLoadProgress } from "../../common/utils/ChunkedFontLoader";
import { getSplashFontConfig, validateSplashFontConfig } from "./SplashFontConfig";

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
        appManager.init();

        this.disableAllNodeSplash();
        this.initUIListeners();

        this.enableMainSplashScreen();
        this.preloadEssentialFonts();
        this.handleAuthorization();
        this.loadIconTop();
        this.loadIconBottom();
    }

    private initUIListeners() {
        uiManager.emitterListener(InternalEvents.MICROSITE_BACK_TO_LOBBY, this.onMicrositeBackToLobby.bind(this), this);
        uiManager.emitterListener(InternalEvents.MICROSITE_OPEN_GAME_BACK_FROM_LOBBY, this.openGameFromMicroGame.bind(this), this);
    }

    private clearUIListeners() {
        uiManager.removeListenersWithTarget(this);
    }

    protected onDestroy(): void {
        this.clearUIListeners();
    }

    private async handleSplashScene(): Promise<void> {
        const urlParams = appManager.urlParams;
        const gameId = +urlParams.get("gameId");
        const params = urlParams.get("params");

        // Handle from standalone micro-site game
        if (params) {
            // clear micro-site game id when returning from session
            SessionManager.removeMicrositeGameId();

            if (isGatewayGame(gameId) && this.handleGatewayGame(gameId)) {
                return;
            }
            this.loadToLobbyOrDirectGame();
            return;
        }

        // Handle SSO game launch
        const isSSOGameLaunch = urlParams.has("token") && urlParams.has("gameId") && gameId !== 0;
        if (isSSOGameLaunch) {
            if (isGatewayGame(gameId) && this.handleGatewayGame(gameId)) {
                return;
            }
            if (this.isMicrositeGame(gameId)) {
                cc.log("Open game microsite at Splash ", gameId);
                await this.enableMicrositeGameIframe(gameId);
                appManager.clearSSOGameId();
                return;
            }
        }

        if (this.handleOpenDummyRoom(isSSOGameLaunch)) {
            return;
        }

        // Handle reload from micro-site game
        const micrositeGameId = +SessionManager.getMicrositeGameId();
        if (!urlParams.has("token") && micrositeGameId > 0) {
            await this.enableMicrositeGameIframe(micrositeGameId);
            return;
        }

        // Default: load to lobby or direct game
        this.loadToLobbyOrDirectGame();
    }

    handleOpenDummyRoom(isSSOToGame) {
        const ssoDirectModeGameId =
            isSSOToGame && appManager.isDirectMode && isMiniGameByGameId(appManager.directGameId) ? appManager.directGameId : -1;
        const dummyRoomStorage = SessionManager.getDummyRoomStorage();
        const dummyRoomGameId = ssoDirectModeGameId > 0 ? ssoDirectModeGameId : dummyRoomStorage ? dummyRoomStorage.gameId : -1;
        if (dummyRoomGameId > 0) {
            SessionManager.storeDummyRoom(dummyRoomGameId);
            cc.director.loadScene("dummy_room");
            return true;
        }

        return false;
    }

    async onMicrositeBackToLobby() {
        await this.handleBackFromMicrositeGame();
        this.loadToLobbyOrDirectGame();
    }

    loadToLobbyOrDirectGame() {
        const mainSplash = this.nodeMainSplash.getComponent(MainSplash);
        mainSplash.loadToLobbyOrDirectGame();
    }

    private async handleBackFromMicrositeGame() {
        this.enableMainSplashScreen();
        await appManager.initNotificationService();
    }

    private async handleAuthorization() {
        await initGameConfiguration();
        if (!appManager.authorized) {
            await appManager.ssoAndAuthorize();
            if (!appManager.authorized) {
                if (!appManager.autoGenerateNickname) {
                    // this.showSignName();
                }
                return;
            }
        }

        this.handleSplashScene();
    }



    handleSignName(response) {
        if (response.authorized) {
            appManager.authorized = true;
            userManager.updateUser(response.user);
            this.serviceAuthorized(response.authorized);
        } else {
            const errorCode = response.errorCode;
            const text = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
            this.showNotice(text);
        }
    }

    async showNotice(text: string) {
        const data = {
            text: text,
            isInfo: false
        };
        uiManager.emitter.emit(InternalEvents.NOTICE, { data });
    }

    serviceAuthorized(Authorized) {
        this.handleSplashScene();
    }

    private async enableMicrositeGameIframe(gameId) {
        const healthy = await GameUtils.healthCheckMicrositeGame(gameId);
        if (!healthy) {
            this.loadToLobbyOrDirectGame();
            return;
        }
        this.activeMicrositeGameNode();
        const urlParams = appManager.urlParams;
        if (urlParams.has("op")) {
            const operator = urlParams.get("op");
            SessionManager.storeOperator(operator);
        }

        if (urlParams.has("gameId")) {
            const gameId = +urlParams.get("gameId");
            SessionManager.clearStorageMicroSite(true);
            SessionManager.storeMicrositeGameId(gameId);
        }
        const iframe = cc.instantiate(this.prfMicrositeGame);
        this.nodeMicrositeGame.addChild(iframe);
    }

    private activeMicrositeGameNode() {
        this.nodeMicrositeGame.active = true;
        this.nodeMainSplash.active = false;
    }

    private enableMainSplashScreen() {
        GameUtils.setCanvasVisibilty(true);
        this.nodeMainSplash.active = true;
        this.nodeMicrositeGame.destroyAllChildren();
        this.nodeMicrositeGame.active = false;
    }

    isMicrositeGame(gameId) {
        const gameConfiguration = getGameConfiguration(gameId);
        const isMicrosite = GameUtils.isMicroSite(gameConfiguration);
        return isMicrosite;
    }

    private async openGameFromMicroGame(gameId: number) {
        SessionManager.storeInRoomGameId(gameId);

        await this.handleBackFromMicrositeGame();
    }

    private disableAllNodeSplash() {
        this.nodeMainSplash.active = false;
        this.nodeMicrositeGame.active = false;
    }

    private loadIconTop() {
        // handle after
    }

    private loadIconBottom() {
        // handle after
    }

    /**
 * Preload essential fonts during splash screen
 * This ensures fonts are ready before the main game loads
 */
    private async preloadEssentialFonts(): Promise<void> {
        try {
            cc.log("[Splash] Starting font preloading...");

            // Get font configuration
            const fontConfig = getSplashFontConfig();

            // Validate configuration
            if (!validateSplashFontConfig(fontConfig)) {
                cc.error("[Splash] Invalid font configuration, skipping font preloading");
                return;
            }

            // Get the main splash component to update progress
            const mainSplash = this.nodeMainSplash.getComponent(MainSplash);

            const { essentialFonts, fontLoadingProgressWeight, showDetailedProgress, fontLoadingTimeout, continueOnFontError } = fontConfig;

            cc.log(`[Splash] Font config: ${essentialFonts.length} fonts, ${fontLoadingProgressWeight * 100}% progress weight`);

            let loadedFonts = 0;
            const totalFonts = essentialFonts.length;

            // Preload each font with progress tracking
            for (const fontName of essentialFonts) {
                try {
                    // Create a timeout promise for font loading
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error(`Font loading timeout for ${fontName}`)), fontLoadingTimeout);
                    });

                    const fontPromise = ChunkedFontLoader.preloadFont(fontName, {
                        useChunkedFont: true,
                        fallbackToRegular: true,
                        timeout: fontLoadingTimeout,
                        onProgress: (progress: FontLoadProgress) => {
                            if (showDetailedProgress) {
                                // Update splash progress for font loading
                                const overallProgress = (loadedFonts + progress.percentage / 100) / totalFonts;
                                if (mainSplash) {
                                    mainSplash.updateProgressWithType(overallProgress * fontLoadingProgressWeight, 'fonts');
                                }

                                cc.log(`[Splash] Loading font ${fontName}: ${progress.percentage.toFixed(1)}%`);
                            }
                        }
                    });

                    // Race between font loading and timeout
                    await Promise.race([fontPromise, timeoutPromise]);

                    loadedFonts++;
                    cc.log(`[Splash] Successfully preloaded font: ${fontName}`);

                } catch (error) {
                    cc.warn(`[Splash] Failed to preload font ${fontName}:`, error);

                    if (!continueOnFontError) {
                        throw error; // Stop loading if configured to not continue on error
                    }

                    // Continue with other fonts even if one fails
                    loadedFonts++;
                }
            }

            cc.log(`[Splash] Font preloading completed: ${loadedFonts}/${totalFonts} fonts loaded`);

            // Update final progress
            if (mainSplash) {
                mainSplash.updateProgressWithType(fontLoadingProgressWeight, 'fonts');
            }

        } catch (error) {
            cc.error("[Splash] Error during font preloading:", error);
            // Don't block the splash screen if font loading fails
        }
    }

    private handleGatewayGame(gameId: number): boolean {
        cc.log("Open gateway at Splash");
        const gameConfiguration = getGameConfiguration(gameId);
        const mainId = gameConfiguration.gateway?.id;
        if (mainId === gameId) {
            GameUtils.openSocketGatewayGame(mainId, this.socketIOControler);
            appManager.clearSSOGameId();
            return true;
        }
        return false;
    }
}
