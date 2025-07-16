import { lazyInject } from "../../Application";
import { i18n } from "../../ClientModules";
import { OperatorAlias } from "../../ISystem";
import SocketIOController from "../../SocketIOController";
import GameUtils from "../../common/GameUtils";
import * as sessionManager from "../../common/auth/SessionManager";
import { sentryLogger } from "../../common/logger";
import Notice from "../../common/notice/view-models/Notice";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { isMiniGameByGameId } from "../../configs/GameConfigurations";
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
    progressBar: cc.Node = null;

    @property(cc.Node)
    progressBarBackground: cc.Node = null;

    @property(cc.Label)
    percentResourceLoad: cc.Label = null;

    @property(cc.Node)
    noticeContainer: cc.Node = null;

    @lazyInject(SocketIOController)
    private readonly socketIOController: SocketIOController;

    @lazyInject(SplashConfig)
    private readonly splashConfig: SplashConfig;

    private loadSceneTimeout: any;

    private noticePrefab: cc.Prefab = null;

    protected onLoad(): void {
        this.progressBar.width = 0;
        this.percentResourceLoad.string = "";
        this.initUIListeners();
    }

    private initUIListeners() {
        uiManager.emitterListener(InternalEvents.NOTICE, this.showNotice.bind(this), this);
        uiManager.emitterListener(
            InternalEvents.SSO_FAILED,
            () => {
                this.messageComp.reset();
                this.messageComp.setMessage(i18n.t("ui.login_failed"));
                uiManager.isPauseLoadingIcons = false;
            },
            this
        );
        uiManager.emitterListener(
            InternalEvents.SSO_ERROR,
            () => {
                this.messageComp.reset();
                this.messageComp.setMessage(i18n.t("ui.connection_lost"));
                uiManager.isPauseLoadingIcons = false;
            },
            this
        );
        uiManager.emitterListener(
            InternalEvents.GAME_IS_UM,
            (eventMessage: { umMessage; gameId }) => {
                const { umMessage } = eventMessage;
                const text = NoticeUtil.getMessageByLocale(umMessage);
                if (text) {
                    const data = {
                        text: text,
                        isInfo: false
                    };
                    uiManager.emitter.emit(InternalEvents.NOTICE, {
                        data,
                        onConfirm: null,
                        onClose: () => this.canNotOpenGameAtSplash()
                    });
                }
                uiManager.isPauseLoadingIcons = false;
            },
            this
        );
        uiManager.emitterListener(
            InternalEvents.NOT_PERMITTED_TO_PLAY,
            (eventMessage) => {
                const { gameId } = eventMessage;
                const gameName = GameUtils.getGameNameString(gameId);
                const message = i18n.t("messages.gameExcluded", { gameName: gameName });
                const data = {
                    text: message,
                    isInfo: true
                };

                uiManager.emitter.emit(InternalEvents.NOTICE, {
                    data,
                    onConfirm: null,
                    onClose: () => this.canNotOpenGameAtSplash()
                });
                uiManager.isPauseLoadingIcons = false;
            },
            this
        );
        uiManager.emitterListener(
            InternalEvents.CAN_NOT_OPEN_GAME_AT_SPLASH,
            () => {
                this.canNotOpenGameAtSplash();
            },
            this
        );
    }

    canNotOpenGameAtSplash() {
        appManager.clearSSOGameId();
        sessionManager.removeInRoomGameId();
        appManager.backToOperatorLobby();
    }

    private clearUIListeners() {
        uiManager.removeListenersWithTarget(this);
    }

    async loadToLobbyOrDirectGame() {
        try {
            console.log('[MainSplash] Starting loadToLobbyOrDirectGame process');
            this.updateProgress(0);

            const ssoGameRoomId = appManager.ssoGameId && !isMiniGameByGameId(appManager.ssoGameId) ? appManager.ssoGameId : 0;
            const gameId = sessionManager.getInRoomGameId() || appManager.directGameId || ssoGameRoomId;

            if (gameId > 0) {
                console.log(`[MainSplash] Loading game directly with ID: ${gameId}`);
                cc.log("Main Splash : loadGameDirectly ", gameId);
                await this.loadGameDirectly(gameId);
                appManager.clearSSOGameId();
            } else {
                console.log('[MainSplash] No game available, redirecting to operator lobby');
                cc.log("Main Splash : No game available");
                appManager.backToOperatorLobby();
            }
        } catch (error) {
            console.error('[MainSplash] Error in loadToLobbyOrDirectGame:', error);
            sentryLogger.logError(error);
        }
    }

    async loadGameDirectly(gameId) {
        console.log(`[MainSplash] Starting to load game directly with ID: ${gameId}`);
        const updateProgress = ({ progress, total }) => {
            console.log(`[MainSplash] Game loading progress - Progress: ${progress}, Total: ${total}`);
            this.onProgress(progress, total);
        };
        uiManager.emitterListener(`${InternalEvents.LOADING_GAME}-${gameId}`, updateProgress, this);
        try {
            await GameUtils.openGameDirect(gameId, this.socketIOController);
            console.log(`[MainSplash] Successfully loaded game with ID: ${gameId}`);
            uiManager.removeListenersWithName(`${InternalEvents.LOADING_GAME}-${gameId}`);
        } catch (error) {
            console.error(`[MainSplash] Failed to load game with ID ${gameId}:`, error);
            cc.warn(`Can not load game directly id ${gameId}`, error);
        }
    }

    preloadLobbyScene() {
        // Direct mode only - no lobby scene needed
        this.loadSceneTimeout = setTimeout(
            function () {
                appManager.backToOperatorLobby();
            }.bind(this),
            100
        );
    }

    onProgress(completedCount, totalCount) {
        const percent = completedCount / totalCount;
        console.log(`[MainSplash] Progress update - Completed: ${completedCount}, Total: ${totalCount}, Percent: ${(percent * 100).toFixed(2)}%`);
        this.updateProgress(percent);
    }

    updateProgress(progress) {
        console.log(`[MainSplash] Updating progress: ${(progress * 100).toFixed(2)}%`);
        if (this) {
            this.updateProgressBar(progress);
        }
    }

    updateProgressBar(progress) {
        const progressPercent = Math.round(progress * 100);
        console.log(`[MainSplash] Progress bar update: ${progressPercent}%`);

        // Update percentage text
        this.percentResourceLoad && (this.percentResourceLoad.string = `載入中 ${progressPercent}%`);

        // Update progress bar width
        if (this.progressBar && this.progressBarBackground) {
            const backgroundWidth = this.progressBarBackground.width;
            const newWidth = (progress * backgroundWidth);
            console.log(`[MainSplash] Progress bar width update - Background width: ${backgroundWidth}, New width: ${newWidth.toFixed(2)}`);
            this.progressBar.width = newWidth;
        } else {
            console.warn('[MainSplash] Progress bar or background not assigned');
        }
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
