import { i18n } from "../../ClientModules";
import AudioManager from "../../common/audio/AudioManager";
import MusicPlayer from "../../common/audio/MusicPlayer";
import * as SessionManager from "../../common/auth/SessionManager";
import BaseComponent from "../../common/BaseComponent";
import GameUtils from "../../common/GameUtils";
import InGameMenu, { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import { isSubMultiplayGame } from "../../common/mutliplay-utils";
import UserProfile from "../../common/user-profile/UserProfile";
import { userManager } from "../../common/user/UserManager";
import PromotionTournamentHandler from "../../lobby/promotions/PromotionTournamentHandler";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import MiniPanel from "../../mini-games-panel/view-models/MiniPanel";
import { loadUserData } from "../_base/action/GameRoomActions";
const { ccclass, property } = cc._decorator;

@ccclass
export default class DummyRoom extends BaseComponent {
    @property(cc.Sprite)
    background: cc.Sprite = null;

    @property(UserProfile)
    userProfile: UserProfile = null;

    @property(MiniPanel)
    currentMiniPanel: MiniPanel = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property
    backgroundCount = 3;

    onLoad() {
        this.initEventListener();
        this.initEventForInGameMenu();
        this.loadRandomBackground();
        appManager.currentScene = this;
        const dummyRoomStorage = SessionManager.getDummyRoomStorage();
        const gameId = dummyRoomStorage.gameId;

        if (!isSubMultiplayGame(gameId)) {
            GameUtils.openGame(gameId, this.currentMiniPanel);
        }

        this.loadUserData(userManager.user);
        MusicPlayer.getInstance().init();
        PromotionTournamentHandler.getInstance().getPromotionTournament();
        this.loading.active = false;
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    initEventListener() {
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
                    onClose: () => appManager.backToOperatorLobby()
                });
                uiManager.isPauseLoadingIcons = false;
            },
            this
        );
    }

    initEventForInGameMenu() {
        const inGameMenu = cc.director.getScene().getComponentInChildren(InGameMenu);
        if (inGameMenu) {
            const node = inGameMenu.node;
            node.on(InGameMenuEvents.GO_TO_LOBBY, this.goToLobbyScene, this);
        }
    }

    loadRandomBackground() {
        const randomBg = Math.ceil(Math.random() * this.backgroundCount); // NOSONAR
        const spriteName = `dummy-room/background/bg-${randomBg}`;
        cc.resources.load<cc.SpriteFrame>(spriteName, cc.SpriteFrame, (err, frame) => {
            if (err) {
                cc.log("Can not load ", spriteName);
                return;
            }
            try {
                this.background.spriteFrame = frame;
            } catch (e) {
                cc.log("Can not set background ", spriteName);
            }
        });
    }

    private goToLobbyScene() {
        appManager.redirectToLobby();
    }

    loadUserData(user) {
        loadUserData(this)(user);
    }

    outRoomGame() {
        if (this.loading) {
            this.loading.active = true;
        }
    }

    onCloseGame() {
        this.outRoomGame();
    }

    onCloseGameClick() {
        AudioManager.getInstance().playClick();
        this.onCloseGame();
    }
}
