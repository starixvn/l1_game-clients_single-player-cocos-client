import * as i18n from "i18n/runtime-scripts/LanguageData";

import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import { InGameMenuEvents } from "../../../common/in-game-menu/InGameMenu";
import MultiplayGameStatisticBoard from "../../../common/statistic-board/MultiplayGameStatisticBoard";
import UserProfile from "../../../common/user-profile/UserProfile";
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
import GameBase from "../../_base/GameBase";
import { GameState } from "../../_base/GameState";
import TableGameBase from "../../_base_new/view-models/TableGameBase";
import MultiplayGame from "./MultiplayGame";
import MultiplayTableGameMenu from "./MultiplayTableGameMenu";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplayTableGame extends MultiplayGame {
    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.Prefab)
    miniPanelPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniPanelContainer: cc.Node = null;

    @property(cc.AudioSource)
    musicBg: cc.AudioSource = null;

    @property(cc.Node)
    mainContainer: cc.Node = null;

    @property(cc.Node)
    noticeNode: cc.Node = null;

    @property(cc.Prefab)
    miniNoticePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    statisticBoardPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    guidePrefab: cc.Prefab = null;

    inGameMenu: MultiplayTableGameMenu;
    userProfile: UserProfile;
    public gameState = GameState.None;
    isWinningNotification = true;
    subContainer: cc.Node;
    onUMGameIds = [];

    closeGameByClick = false;
    openOtherScene = false;
    closingGameRoom = false;

    assignPropertiesForSingle(single: TableGameBase, isMain: boolean, gameId: number) {
        super.assignPropertiesForSingle(single, isMain, gameId);
        single.userProfile = this.userProfile;
        single.onCloseGameCallback = this.onCloseGame.bind(this);
        single.onUmCallback = this.checkToShowUMPopup.bind(this);
    }

    onLoad() {
        loadMiniPanel(this)();
        super.onLoad();

        //for room game
        appManager.currentScene = this;
        this.loadUserData(userManager.user);
        this.subContainer = this.subGamesArea[0];
        this.initBackgroundMusic();
        this.loading.active = true;
    }

    onDestroy() {
        super.onDestroy();
        appManager.currentScene = null;
    }

    onEnable() {
        super.onEnable();

        const gameSetting = GameUtils.getSpecificGameSetting(this.gameId);
        this.isWinningNotification = gameSetting.showWinningNotification ?? true;
        this.inGameMenu.winningNotifiationComp.setSwapStatus(this.isWinningNotification);
        gameSetting.showWinningNotification = this.isWinningNotification;
        GameUtils.setSpecificGameSetting(this.gameId, gameSetting);
        this.handleSubGamesArea();
    }

    setGameConfigs(gameConfigs: any) {
        this.loading.active = false;
        const storageData = GameUtils.getGameSetting(this.gameId);
        if (!storageData.currentBet) {
            super.setGameConfigs(gameConfigs);
            return;
        }

        this.betChips.setCurrentBet(`${storageData.currentBet}`);
        super.setGameConfigs(gameConfigs);
        this.betChips.setSelectedIndexAndScroll(`${storageData.currentBet}`);
    }

    onDisconnected() {
        this.closeGame();
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

    onChangedBetChip(bet: number) {
        super.onChangedBetChip(bet);
        const storageData = GameUtils.getGameSetting(this.gameId);
        storageData.currentBet = bet;
        GameUtils.setGameSetting(this.gameId, storageData);
    }

    onIngameMenuInitialized(node: cc.Node) {
        const inGameMenu = node.getComponent(MultiplayTableGameMenu);
        if (inGameMenu) {
            this.inGameMenu = inGameMenu;
            this.initEventForInGameMenu();
        }
    }

    initEventForInGameMenu(): cc.Node {
        const node = this.inGameMenu.node;

        node.on(InGameMenuEvents.OPEN_HISTORY, this.openHistory, this);
        node.on(InGameMenuEvents.OPEN_GUIDE, this.openGuide, this);
        node.on(InGameMenuEvents.GO_TO_LOBBY, this.onCloseGameClick, this);
        node.on(InGameMenuEvents.OPEN_STATISTIC, this.onScoreBoardClick, this);
        node.on(InGameMenuEvents.CHANGE_WINNING_NOTIFICATION, this.onWinningNotificationClick, this);
        return node;
    }

    onCloseGameClick() {
        this.closeGameByClick = true;
        this.onCloseGame();
    }

    openHistory() {
        AudioManager.getInstance().playClick();
    }

    openGuide() {
        AudioManager.getInstance().playClick();
    }

    onScoreBoardClick() {
        AudioManager.getInstance().playClick();
        const node = cc.instantiate(this.statisticBoardPrefab);
        this.currentMiniPanel.addDialog(node);

        const scoreBoard = node.getComponent(MultiplayGameStatisticBoard);
        scoreBoard.init(this.games);
        scoreBoard.openGameCallback = (gameId) => {
            this.switchGameToMain(gameId);
        };
    }

    onWinningNotificationClick() {
        this.isWinningNotification = !this.isWinningNotification;
        this.inGameMenu.winningNotifiationComp.setSwapStatus(this.isWinningNotification);
        this.isWinningNotification
            ? this.showMiniWarning(i18n.t("messages.winningNotificationOn"))
            : this.showMiniWarning(i18n.t("messages.winningNotificationOff"));

        const gameSetting = GameUtils.getSpecificGameSetting(this.gameId);
        gameSetting.showWinningNotification = this.isWinningNotification;
        GameUtils.setSpecificGameSetting(this.gameId, gameSetting);
    }

    showMiniWarning(data): cc.Node {
        if (!this.node.activeInHierarchy) {
            return null;
        }
        const notice = cc.instantiate(this.miniNoticePrefab);
        const noticeComponent = notice.getComponent("mini_warning");
        noticeComponent.text.string = data;
        this.noticeNode.addChild(notice);
        return notice;
    }

    onGameHide() {
        super.onGameHide();
        this.closeGame();
    }

    checkToShowUMPopup(gameId, data) {
        this.onUMGameIds.push(gameId);

        const notUmAll = this.gameIds.some((gameId) => !this.onUMGameIds.includes(gameId));
        if (!notUmAll) {
            this.closeGameByClick = true;
            (this.games[this.gameId] as TableGameBase).showUmMessagePopup(data);
        }
    }

    //#region Methods for room game
    onCloseGame() {
        leaveGameRoom(this)();
    }

    closeGame() {
        closeGame(this)();
    }

    outRoomGame() {
        return outRoomGame(this)();
    }

    loadUserData(user) {
        loadUserData(this)(user);
    }

    //#region  Methods for room game => Multiplay
    stopGame() {
        Object.values(this.games).forEach((game: GameBase) => {
            game.stopGame();
        });
    }

    onUserProfileInitialized(node: cc.Node) {
        onUserProfileInitialized(this)(node);
        Object.values(this.games).forEach((game: GameBase) => (game.userProfile = this.userProfile));
    }
    //#endregion Methods for room game => Multiplay
    //#endregion Methods for room game

    handleSubGamesArea() {
        super.handleSubGamesArea();
        const icon = this.collapsedExpandButton.node.getChildByName("icon-arrow");
        icon.scaleX = this.collapsedExpandButton.isChecked ? 1 : -1;
    }

    showSubGamesWithAnimation(isAnimated = true) {
        if (isAnimated) {
            cc.tween(this.subContainer)
                .to(
                    0.2,
                    { position: cc.v3(0, 0, 0) },
                    {
                        easing: "sineOut",
                        onUpdate: (target) => {
                            this.onMainGamePosition(target);
                        }
                    }
                )
                .start();
        } else {
            this.subContainer.position = cc.v3(0, 0, 0);
            this.mainContainer.position = cc.v3(0, 0, 0);
        }

        this.notificationWidget.right = 10;
        this.notificationWidget.updateAlignment();
        this.gameNotification.setWidthWhenExpandedSubGames();
    }

    hideSubGamesWithAnimation(isAnimated = true) {
        const subGamesWidth = this.subContainer.width;
        if (isAnimated) {
            cc.tween(this.subContainer)
                .to(
                    0.2,
                    { position: cc.v3(subGamesWidth, this.subContainer.position.y, 0) },
                    {
                        easing: "sineIn",
                        onUpdate: (target) => {
                            this.onMainGamePosition(target);
                        }
                    }
                )
                .start();
        } else {
            this.subContainer.position = cc.v3(subGamesWidth, this.subContainer.position.y, 0);
            this.mainContainer.position = cc.v3(subGamesWidth / 2, this.mainContainer.position.y, 0);
        }
        this.notificationWidget.right = subGamesWidth + 10;
        this.notificationWidget.updateAlignment();
        this.gameNotification.setWidthWhenCollapseSubGames();
    }

    onMainGamePosition(target) {
        this.mainContainer.position = cc.v3(target.position.x / 2, this.mainContainer.position.y, 0);
    }
}
