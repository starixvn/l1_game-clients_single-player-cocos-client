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
        this.initUIListeners();
        this.deactivateAllSlogans();
        this.activateSlogan();
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

        if (appManager.isDirectMode) {
            appManager.backToOperatorLobby();
        } else {
            this.preloadLobbyScene();
        }
    }

    private clearUIListeners() {
        uiManager.removeListenersWithTarget(this);
    }

    async loadToLobbyOrDirectGame() {
        try {
            this.updateProgress(0);

            const ssoGameRoomId = appManager.ssoGameId && !isMiniGameByGameId(appManager.ssoGameId) ? appManager.ssoGameId : 0;
            const gameId = sessionManager.getInRoomGameId() || appManager.directGameId || ssoGameRoomId;

            if (gameId > 0) {
                cc.log("Main Splash : loadGameDirectly ", gameId);
                await this.loadGameDirectly(gameId);
                appManager.clearSSOGameId();
            } else {
                cc.log("Main Splash : Goto Lobby");
                this.preloadLobbyScene();
            }
        } catch (error) {
            sentryLogger.logError(error);
        }
    }

    async loadGameDirectly(gameId) {
        const updateProgress = ({ progress, total }) => {
            this.onProgress(progress, total);
        };
        uiManager.emitterListener(`${InternalEvents.LOADING_GAME}-${gameId}`, updateProgress, this);
        try {
            await GameUtils.openGameDirect(gameId, this.socketIOController);
            uiManager.removeListenersWithName(`${InternalEvents.LOADING_GAME}-${gameId}`);
        } catch (error) {
            cc.warn(`Can not load game directly id ${gameId}`, error);
        }
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
