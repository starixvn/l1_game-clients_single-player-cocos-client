import _ = require("lodash");

import { lazyInject } from "../../Application";
import AudioManager from "../../common/audio/AudioManager";
import MusicPlayer from "../../common/audio/MusicPlayer";
import GameUtils from "../../common/GameUtils";
import { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import UmWarning from "../../common/um-warning/UmWarning";
import { userManager } from "../../common/user/UserManager";
import { appManager } from "../../managers/AppManager";
import SocketIOController from "../../SocketIOController";
import {
    closeGame,
    handleMusicWhenJoinGame,
    loadMiniPanel,
    loadUserData,
    onUserProfileInitialized,
    outRoomGame
} from "./action/GameRoomActions";
import GameBase from "./GameBase";
import { GameBasePlayerHandler } from "./handlers/GameBasePlayerHandler";
import RoomPlayer from "./view-models/RoomPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WebSocketTableGameBase extends GameBase {
    @property({ type: UmWarning, visible: false, override: true })
    umNotice: UmWarning = null;

    @property({ type: RoomPlayer })
    players: RoomPlayer[] = [];

    @property({ type: cc.Node })
    otherPlayers: cc.Node = null;

    @property(cc.Prefab)
    miniPanelPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniPanelContainer: cc.Node = null;

    @property(cc.Prefab)
    noticePrefab: cc.Prefab = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.Prefab)
    winningPlayerEffectPrefab: cc.Prefab = null;

    @property(cc.AudioSource)
    musicBg: cc.AudioSource = null;

    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;

    get WinningAnimationDuration() {
        return 3;
    }

    playerHandler: GameBasePlayerHandler;

    constructor() {
        super();
    }

    get isOwnGameMusicBackground(): boolean {
        return !!this.musicBg;
    }

    openOtherScene = false;
    closingGameRoom = false;

    onLoad() {
        super.onLoad();
        appManager.currentScene = this;
        loadMiniPanel(this)();
        this.loadUserData(userManager.user);
        this.players.forEach((player) => (player.node.active = false));
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

    initHandlers() {
        super.initHandlers();

        this.playerHandler = new GameBasePlayerHandler(this);
    }

    onDisconnected() {
        this.closeGame();
    }

    onData(data: any) {
        this.currentMiniPanel.onGeneralData(data);
        this.onDataGameRoomGeneral(data);

        const gameData = data[this.gameName];
        if (gameData) {
            this.onDataGameRoom(gameData);
            const apiErrorGameData = gameData.apiError;
            if (apiErrorGameData) {
                if (this.updateUserStakeLevel(apiErrorGameData)) {
                    this.showMiniWarningLimitBetChanged();
                }
            }
        }
    }

    onUserProfileInitialized(node: cc.Node) {
        onUserProfileInitialized(this)(node);
    }

    showUmMessage(data: any) {
        if (this.isDisableGame) {
            return;
        }

        this.showUmMessagePopup(data);
    }

    onCloseGameClick() {
        //keep function name, for old game prefab
        this.closeGameByClick = true;
        this.onCloseGame();
    }

    onCloseGame() {
        if (this.isOwnGameMusicBackground) {
            MusicPlayer.getInstance().handleIncreaseVolume();
        }
        this.closeGame();
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
            this.musicBg?.play();
        }
    }

    playMusicBackground(play: boolean) {
        if (play && appManager.GAME_IS_SHOWED) {
            this.playInvidiualMusic();
        } else {
            this.stopInvidiualMusic();
        }
    }

    stopInvidiualMusic() {
        this.musicBg?.stop();
    }

    closeGame() {
        closeGame(this)();
    }

    outRoomGame() {
        return outRoomGame(this)();
    }

    showAcceptedBet(bet: number) {
        GameUtils.addFlyingText(this.userProfile.node, false, bet, 1, 80);
    }

    showWinningBet(bet: number) {
        const winningBet = GameUtils.addFlyingText(this.userProfile.node, true, bet, this.WinningAnimationDuration, 80, 10);
        winningBet.name = "winningBet";
    }

    clearWinningBet() {
        const winningBet = this.userProfile.node.getChildByName("winningBet");
        if (winningBet) {
            winningBet.destroy();
        }
    }

    clearWinningEffect() {
        const winningEffect = this.userProfile.node.getChildByName("winningEffect");
        if (winningEffect) {
            winningEffect.destroy();
        }
    }

    protected onGameHide() {
        super.onGameHide();
        this.closeGame();
    }

    protected onDataGameRoomGeneral(data: any) {
        if (data.user) {
            userManager.updateUser(data.user);
        }

        if (data.kickedOut || data.apiError) {
            this.unlockBet();
            this.showProcessingWarning(false);
        }

        if (data.apiError) {
            if (this.updateUserStakeLevel(data.apiError)) {
                this.showMiniWarningLimitBetChanged();
            }
        }

        if (data.userStakeLevel) {
            if (
                data.userStakeLevel.minBet !== userManager.stakeLevel.minBet ||
                data.userStakeLevel.maxBet !== userManager.stakeLevel.maxBet
            ) {
                if (this.updateUserStakeLevel(data.userStakeLevel)) {
                    this.showMiniWarningLimitBetChanged();
                }
            }
        }
    }

    protected onDataGameRoom(data: any) {
        super.onData(data);

        if (this.players && this.players.length > 0) {
            this.playerHandler && this.playerHandler.handle(data);
        }
    }

    protected loadUserData(user) {
        loadUserData(this)(user);
    }

    initEventForInGameMenu() {
        const node = super.initEventForInGameMenu();

        node.on(InGameMenuEvents.GO_TO_LOBBY, this.onCloseGameClick, this);

        return node;
    }

    getPlayerSlot(playerId: string): RoomPlayer {
        return _.find(this.players, (player) => player.data && player.data.id === playerId);
    }
}
