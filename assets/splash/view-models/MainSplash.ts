import { lazyInject } from "../../Application";
import { i18n } from "../../ClientModules";
import { OperatorAlias } from "../../ISystem";
import SocketIOController from "../../SocketIOController";
import GameUtils from "../../common/GameUtils";
import LobbyUtils from "../../common/LobbyUtils";
import * as sessionManager from "../../common/auth/SessionManager";
import { sentryLogger } from "../../common/logger";
import Notice from "../../common/notice/view-models/Notice";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { isMiniGameByGameId } from "../../configs/GameConfigurations";
import LobbyMenuConfig from "../../lobby/main/view-models/LobbyMenuConfig";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import RandomWaitingMessage from "./RandonWaitingMessage";
import SplashConfig from "./SplashConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainSplash extends cc.Component {
    @property(RandomWaitingMessage)
    messageComp: RandomWaitingMessage = null;

    @property(cc.Asset)
    manifestUrl: cc.Asset = null;

    @property(cc.Node)
    containerProgressBar: cc.Node = null;

    @property(cc.Label)
    percentResourceLoad: cc.Label = null;

    @property(cc.Node)
    sloganSC1: cc.Node = null;

    @property(cc.Node)
    sloganSC2: cc.Node = null;

    @property(cc.Node)
    sloganSabaPlay: cc.Node = null;

    @property(cc.Node)
    sloganOtherVG: cc.Node = null;

    @property(cc.Node)
    sloganOtherSG: cc.Node = null;

    @property(cc.Node)
    sloganTip88: cc.Node = null;

    @property(cc.Node)
    noticeContainer: cc.Node = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    @lazyInject(SocketIOController)
    private readonly socketIOController: SocketIOController;

    @lazyInject(SplashConfig)
    private readonly splashConfig: SplashConfig;

    private loadSceneTimeout: any;

    private noticePrefab: cc.Prefab = null;

    protected onLoad(): void {
        console.log("🎯 [MainSplash] ===== onLoad started =====");
        const startTime = Date.now();

        console.log("🎯 [MainSplash] Component properties:", {
            hasMessageComp: !!this.messageComp,
            hasManifestUrl: !!this.manifestUrl,
            hasContainerProgressBar: !!this.containerProgressBar,
            hasPercentResourceLoad: !!this.percentResourceLoad,
            hasSloganSC1: !!this.sloganSC1,
            hasSloganSC2: !!this.sloganSC2,
            hasSloganSabaPlay: !!this.sloganSabaPlay,
            hasSloganOtherVG: !!this.sloganOtherVG,
            hasSloganOtherSG: !!this.sloganOtherSG,
            hasSloganTip88: !!this.sloganTip88,
            hasNoticeContainer: !!this.noticeContainer
        });

        console.log("🎯 [MainSplash] Initializing UI listeners...");
        this.initUIListeners();

        console.log("🎯 [MainSplash] Deactivating all slogans...");
        this.deactivateAllSlogans();

        console.log("🎯 [MainSplash] Activating appropriate slogan...");
        this.activateSlogan();

        const endTime = Date.now();
        console.log("🎯 [MainSplash] ===== onLoad completed in", (endTime - startTime), "ms =====");
    }

    private deactivateAllSlogans(): void {
        const slogans = ["sloganSC1", "sloganSC2", "sloganSabaPlay", "sloganOtherVG", "sloganOtherSG", "sloganTip88"];

        for (const slogan of slogans) {
            this.setSloganActiveState(slogan, false);
        }
    }

    private activateSlogan(): void {
        const operator = sessionManager.getOperator()?.toUpperCase();
        if (!operator) {
            this.activateOtherSlogans();
            return;
        }

        const sloganMapping: { [key: string]: string } = {
            [OperatorAlias.SG]: "sloganSC1",
            [OperatorAlias.VG]: "sloganSC2",
            [OperatorAlias.SP]: "sloganSabaPlay",
            [OperatorAlias.TIP88]: "sloganTip88"
        };

        const slogan = sloganMapping[operator];
        if (slogan) {
            this.setSloganActiveState(slogan, true);
        } else {
            this.activateOtherSlogans();
        }
    }

    private activateOtherSlogans(): void {
        this.setSloganActiveState("sloganOtherVG", !this.splashConfig.enabledSC1);
        this.setSloganActiveState("sloganOtherSG", this.splashConfig.enabledSC1);
    }

    private setSloganActiveState(slogan: string, isActive: boolean): void {
        this[slogan].active = isActive;
    }

    private initUIListeners() {
        console.log("🎯 [MainSplash] ===== initUIListeners started =====");

        console.log("🎯 [MainSplash] Setting up NOTICE event listener...");
        uiManager.emitterListener(InternalEvents.NOTICE, this.showNotice.bind(this), this);

        console.log("🎯 [MainSplash] Setting up SSO_FAILED event listener...");
        uiManager.emitterListener(
            InternalEvents.SSO_FAILED,
            () => {
                console.log("🎯 [MainSplash] 🔐 SSO_FAILED event received");
                this.messageComp.reset();
                this.messageComp.setMessage(i18n.t("ui.login_failed"));
                uiManager.isPauseLoadingIcons = false;
                console.log("🎯 [MainSplash] SSO failed message displayed");
            },
            this
        );

        console.log("🎯 [MainSplash] Setting up SSO_ERROR event listener...");
        uiManager.emitterListener(
            InternalEvents.SSO_ERROR,
            () => {
                console.log("🎯 [MainSplash] ❌ SSO_ERROR event received");
                this.messageComp.reset();
                this.messageComp.setMessage(i18n.t("ui.connection_lost"));
                uiManager.isPauseLoadingIcons = false;
                console.log("🎯 [MainSplash] SSO error message displayed");
            },
            this
        );

        console.log("🎯 [MainSplash] Setting up GAME_IS_UM event listener...");
        uiManager.emitterListener(
            InternalEvents.GAME_IS_UM,
            (eventMessage: { umMessage; gameId }) => {
                console.log("🎯 [MainSplash] 🚫 GAME_IS_UM event received:", {
                    umMessage: eventMessage.umMessage,
                    gameId: eventMessage.gameId
                });
                const { umMessage } = eventMessage;
                const text = NoticeUtil.getMessageByLocale(umMessage);
                if (text) {
                    const data = {
                        text: text,
                        isInfo: false
                    };
                    console.log("🎯 [MainSplash] Showing UM notice with text:", text);
                    uiManager.emitter.emit(InternalEvents.NOTICE, {
                        data,
                        onConfirm: null,
                        onClose: () => this.canNotOpenGameAtSplash()
                    });
                } else {
                    console.log("🎯 [MainSplash] No localized text found for UM message");
                }
                uiManager.isPauseLoadingIcons = false;
            },
            this
        );

        console.log("🎯 [MainSplash] Setting up NOT_PERMITTED_TO_PLAY event listener...");
        uiManager.emitterListener(
            InternalEvents.NOT_PERMITTED_TO_PLAY,
            (eventMessage) => {
                console.log("🎯 [MainSplash] 🚫 NOT_PERMITTED_TO_PLAY event received:", eventMessage);
                const { gameId } = eventMessage;
                const gameName = GameUtils.getGameNameString(gameId);
                const message = i18n.t("messages.gameExcluded", { gameName: gameName });
                const data = {
                    text: message,
                    isInfo: true
                };

                console.log("🎯 [MainSplash] Showing NOT_PERMITTED_TO_PLAY notice with text:", message);
                uiManager.emitter.emit(InternalEvents.NOTICE, {
                    data,
                    onConfirm: null,
                    onClose: () => this.canNotOpenGameAtSplash()
                });
                uiManager.isPauseLoadingIcons = false;
            },
            this
        );

        console.log("🎯 [MainSplash] Setting up CAN_NOT_OPEN_GAME_AT_SPLASH event listener...");
        uiManager.emitterListener(
            InternalEvents.CAN_NOT_OPEN_GAME_AT_SPLASH,
            () => {
                console.log("🎯 [MainSplash] 🚫 CAN_NOT_OPEN_GAME_AT_SPLASH event received");
                this.canNotOpenGameAtSplash();
            },
            this
        );
        console.log("🎯 [MainSplash] ===== initUIListeners completed =====");
    }

    canNotOpenGameAtSplash() {
        console.log("🎯 [MainSplash] ===== canNotOpenGameAtSplash called =====");
        console.log("🎯 [MainSplash] Clearing SSO game ID and in-room game ID");
        appManager.clearSSOGameId();
        sessionManager.removeInRoomGameId();

        if (appManager.isDirectMode) {
            console.log("🎯 [MainSplash] 🔄 Direct mode detected, returning to operator lobby");
            appManager.backToOperatorLobby();
        } else {
            console.log("🎯 [MainSplash] 📍 Preloading lobby scene");
            this.preloadLobbyScene();
        }
        console.log("🎯 [MainSplash] ===== canNotOpenGameAtSplash completed =====");
    }

    private clearUIListeners() {
        uiManager.removeListenersWithTarget(this);
    }

    async loadToLobbyOrDirectGame() {
        console.log("🎯 [MainSplash] ===== loadToLobbyOrDirectGame started =====");
        const startTime = Date.now();

        try {
            console.log("🎯 [MainSplash] Updating progress to 0%");
            this.updateProgress(0);

            const ssoGameRoomId = appManager.ssoGameId && !isMiniGameByGameId(appManager.ssoGameId) ? appManager.ssoGameId : 0;
            const gameId = sessionManager.getInRoomGameId() || appManager.directGameId || ssoGameRoomId;

            console.log("🎯 [MainSplash] Game ID calculation:", {
                ssoGameId: appManager.ssoGameId,
                isMiniGame: isMiniGameByGameId(appManager.ssoGameId),
                ssoGameRoomId,
                inRoomGameId: sessionManager.getInRoomGameId(),
                directGameId: appManager.directGameId,
                finalGameId: gameId
            });

            if (gameId > 0) {
                console.log("🎯 [MainSplash] 🎮 Loading game directly:", gameId);
                await this.loadGameDirectly(gameId);
                console.log("🎯 [MainSplash] Clearing SSO game ID after direct game load");
                appManager.clearSSOGameId();
            } else {
                console.log("🎯 [MainSplash] 🏠 Going to lobby");
                this.preloadLobbyScene();
            }
        } catch (error) {
            console.error("🎯 [MainSplash] ❌ Error in loadToLobbyOrDirectGame:", error);
            sentryLogger.logError(error);
        }

        const endTime = Date.now();
        console.log("🎯 [MainSplash] ===== loadToLobbyOrDirectGame completed in", (endTime - startTime), "ms =====");
    }

    async loadGameDirectly(gameId) {
        console.log("🎯 [MainSplash] ===== loadGameDirectly started =====");
        const startTime = Date.now();

        console.log("🎯 [MainSplash] Loading game directly for game ID:", gameId);

        const updateProgress = ({ progress, total }) => {
            console.log("🎯 [MainSplash] Game loading progress:", { progress, total, percentage: Math.round((progress / total) * 100) });
            this.onProgress(progress, total);
        };

        console.log("🎯 [MainSplash] Setting up progress listener for game:", gameId);
        uiManager.emitterListener(`${InternalEvents.LOADING_GAME}-${gameId}`, updateProgress, this);

        try {
            console.log("🎯 [MainSplash] Opening game directly...");
            await GameUtils.openGameDirect(gameId, this.socketIOController);
            console.log("🎯 [MainSplash] ✅ Game opened successfully");
            uiManager.removeListenersWithName(`${InternalEvents.LOADING_GAME}-${gameId}`);
            console.log("🎯 [MainSplash] Progress listener removed");
        } catch (error) {
            console.error("🎯 [MainSplash] ❌ Cannot load game directly:", gameId, error);
            cc.warn(`Can not load game directly id ${gameId}`, error);
        }

        const endTime = Date.now();
        console.log("🎯 [MainSplash] ===== loadGameDirectly completed in", (endTime - startTime), "ms =====");
    }

    preloadLobbyScene() {
        this.loadSceneTimeout = setTimeout(
            function () {
                LobbyUtils.gotoLobbyScene(this.onProgress.bind(this), this.lobbyMenuConfig, this.splashConfig);
            }.bind(this),
            100
        );
    }

    onProgress(completedCount, totalCount) {
        const percent = completedCount / totalCount;
        this.updateProgress(percent);
    }

    updateProgress(progress) {
        if (this) {
            this.updateProgressBar(progress);
        }
    }

    updateProgressBar(progress) {
        this.percentResourceLoad && (this.percentResourceLoad.string = `${Math.round(progress * 100)}%`);
    }

    protected onDestroy(): void {
        clearTimeout(this.loadSceneTimeout);
        this.clearUIListeners();
    }

    async showNotice(eventMessage: { data; onConfirm; onClose }) {
        const { data, onConfirm, onClose } = eventMessage;
        if (!this.noticePrefab) {
            this.noticePrefab = await GameUtils.loadResource("shared/prefabs/Notice");
        }

        if (this.noticePrefab) {
            const node = cc.instantiate(this.noticePrefab);
            const notice = node.getComponent(Notice);

            data.button = { text: "OK" };
            notice.init(data);

            if (onConfirm) {
                notice.handleClickButton = onConfirm;
            }

            if (onClose) {
                notice.handleClose = onClose;
            }

            this.noticeContainer.addChild(node);
        }
    }
}
