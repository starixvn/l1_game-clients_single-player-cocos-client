import AudioManager from "../../../common/audio/AudioManager";
import GameIdSprite from "../../../common/GameIdSprite";
import { InGameMenuEvents } from "../../../common/in-game-menu/InGameMenu";
import UmWarning from "../../../common/um-warning/UmWarning";
import { userManager } from "../../../common/user/UserManager";
import { appManager } from "../../../managers/AppManager";
import {
    closeGame,
    handleMusicWhenJoinGame,
    leaveGameRoom,
    loadMiniPanel,
    loadUserData,
    onUserProfileInitialized,
    outRoomGame
} from "../../_base/action/GameRoomActions";
import TableGameBase from "./TableGameBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandAloneTableGameBase extends TableGameBase {
    //#region override some properties to hide them
    @property({ visible: false, override: true })
    betPercentage: cc.Label[] = [];

    @property({ visible: false, override: true })
    waitingDotsSubGame: cc.Node = null;

    @property({ visible: false, override: true })
    gameNameSprite: GameIdSprite = null;

    @property({ visible: false, override: true })
    tableGameBg: cc.Node = null;

    @property({ visible: false, override: true })
    umNotice: UmWarning = null;
    //end region override

    @property(cc.Prefab)
    miniPanelPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniPanelContainer: cc.Node = null;

    @property(cc.Prefab)
    noticePrefab: cc.Prefab = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.AudioSource)
    musicBg: cc.AudioSource = null;

    openOtherScene = false;
    closingGameRoom = false;

    onLoad() {
        loadMiniPanel(this)();
        super.onLoad();
        this.initForStandaloneGame();
    }

    protected initForStandaloneGame() {
        appManager.currentScene = this;
        this.loadUserData(userManager.user);
        this.initBackgroundMusic();
        this.loading.active = true;
    }

    public updateDisplayForRemoteConfig() {
        super.updateDisplayForRemoteConfig();
        this.loading.active = false;
    }

    onDestroy() {
        super.onDestroy();
        appManager.currentScene = null;
    }

    initEventForInGameMenu() {
        const node = super.initEventForInGameMenu();

        node.on(InGameMenuEvents.GO_TO_LOBBY, this.onCloseGameClick, this);

        return node;
    }

    onCloseGameClick() {
        this.closeGameByClick = true;
        this.onCloseGame();
    }

    loadUserData(user) {
        loadUserData(this)(user);
    }

    onUserProfileInitialized(node: cc.Node) {
        onUserProfileInitialized(this)(node);
    }

    //#region Methods for room game
    get isOwnGameMusicBackground(): boolean {
        return !!this.musicBg;
    }

    async initBackgroundMusic() {
        this.registerBackgroundMusicListener();
        await handleMusicWhenJoinGame(this)();
        this.playMusicOnEnterGame();
    }

    playMusicOnEnterGame() {
        this.isOwnGameMusicBackground && this.playMusicBackground(AudioManager.getInstance().musicEnabled);
    }

    registerBackgroundMusicListener() {
        this.isOwnGameMusicBackground && AudioManager.getInstance().addMusicChanged(`${this.gameId}`, this.playMusicBackground.bind(this));
    }

    async playInvidiualMusic() {
        await AudioManager.getInstance().awaitForReady();
        if (AudioManager.getInstance().musicEnabled) {
            this.musicBg.play();
        }
    }

    playMusicBackground(play: boolean) {
        if (play) {
            this.playInvidiualMusic();
        } else {
            this.stopInvidiualMusic();
        }
    }

    stopInvidiualMusic() {
        this.musicBg?.stop();
    }

    onCloseGame() {
        leaveGameRoom(this)();
    }

    closeGame() {
        closeGame(this)();
    }

    outRoomGame() {
        return outRoomGame(this)();
    }

    onGameHide() {
        super.onGameHide();
        this.closeGame();
    }
    override onGameShow() {
        //empty
    }

    onDisconnected() {
        this.closeGame();
    }
}
