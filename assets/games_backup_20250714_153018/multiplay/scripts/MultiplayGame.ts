import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../../analytics/AnalyticsManager";
import { lazyInject } from "../../../Application";
import AudioManager from "../../../common/audio/AudioManager";
import BetChips from "../../../common/bet-chips/view-models/BetChips";
import DraggableItem from "../../../common/draggable-layout/view-models/DraggableItem";
import InternalGameNotification from "../../../common/game-notification/InternalGameNotification";
import GameUtils from "../../../common/GameUtils";
import SocketIOController from "../../../SocketIOController";
import GameBase from "../../_base/GameBase";
import { GameState } from "../../_base/GameState";
import GameViewBase from "../../_base/GameViewBase";
import { GameConfigs } from "../../_base_new/models/GameConfigs";
import NewGameData from "../../_base_new/models/NewGameData";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { KeyStorageStatisticOpen } from "./MultiplayGameSingle";
import MultiplayPromotionGuide from "./MultiplayPromotionGuide";
import MultiplayScoreBoard from "./MultiplayScoreBoard";

const { ccclass, property } = cc._decorator;

enum ItemSlot {
    Main = -1,
    Sub_1 = 0,
    Sub_2,
    Sub_3
}

@ccclass
export default class MultiplayGame extends GameViewBase {
    @property(cc.Node)
    mainContent: cc.Node = null;

    @property({ type: cc.Node })
    subContents: cc.Node[] = [];

    @property(cc.Prefab)
    normallPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    smallPrefab: cc.Prefab = null;

    @property({ type: cc.Node })
    subGamesArea: cc.Node[] = [];

    @property(cc.Toggle)
    collapsedExpandButton: cc.Toggle = null;

    @property(cc.Node)
    bgShadow: cc.Node = null;

    @property(cc.Prefab)
    scoreBoardPrefab: cc.Prefab = null;

    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;

    promotionGuideComp: MultiplayPromotionGuide = null;
    gameNotification: InternalGameNotification = null;
    notificationWidget: cc.Widget;

    normalPrefabs: cc.Prefab[] = [];
    smallPrefabs: cc.Prefab[] = [];
    gameIds: number[] = [];
    mainGameId: number;
    locations = {};
    games = {};
    betChips: BetChips;
    currentBet: number;
    protected isGameOpened = false;
    gamesState = {};

    onLoad() {
        super.onLoad();
        this.initLocations();
        this.initMultiplayLayout();
        this.initSockets();

        (this.games[this.gameIds[0]] as GameBase).gameData.gameConfigs.on(GameConfigs.Events.CHANGE, this.setGameConfigs.bind(this));
        this.resetStatisticShow();
        this.initGameDataEvents();

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            game_name: GameUtils.getGameNameString(this.gameId),
            action: TrackingAction.Show,
            object_name: "Show SubGames"
        });
    }

    initGameDataEvents() {
        const game = this.games[this.gameId] as MiniGameBase;
        game.gameData.on(NewGameData.Events.CHANGE_STATUS_SHOW_STATISTIC, (status) => {
            this.storageStatusStatistic(status);
        });
    }

    onInitializeGameNotification(node: cc.Node) {
        this.gameNotification = node.getComponent(InternalGameNotification);
        this.notificationWidget = node.parent.getComponent(cc.Widget);
    }

    callbackWinningStreak = (game, data: { choice: string; count: number }) => {
        const gameSetting = GameUtils.getSpecificGameSetting(this.gameId);
        if (gameSetting.showWinningNotification) {
            this.addWinningStreakNotification(game.gameId, data);
        }
    };

    callbackWinningResult = (game, status: { win: boolean; bet: number }) => {
        const { win, bet } = status;

        if (win) {
            const node = game.betItems[0].node;
            const onScreen = GameUtils.checkIntersectNodes(this.subGamesArea[0], node);
            const isNotMainGame = game.gameId !== this.mainGameId;
            if (isNotMainGame && (!onScreen || !this.collapsedExpandButton.isChecked)) {
                this.addWinningResultNotification(game.gameId, bet);
            }
        }
    };

    addWinningResultNotification(gameId: number, amount: number) {
        if (!this.gameNotification) {
            return;
        }
        this.gameNotification.addNotification({ gameId, amount }, 0);
    }

    addWinningStreakNotification(gameId: number, data: { choice: string; count: number }) {
        if (!this.gameNotification) {
            return;
        }
        const { choice, count } = data;
        this.gameNotification.addNotification({ gameId, choice, count }, 1);
    }

    start() {
        this.initDraggableItems();
    }

    initDraggableItems() {
        const draggableItems = this.getComponentsInChildren(DraggableItem);
        draggableItems.forEach((draggableItem) => {
            draggableItem.touchCallback.start = () => {
                this.node.parent.insertChild(this.node, this.node.parent.childrenCount - 1);
            };
        });
    }

    onDestroy() {
        Object.values(this.games).forEach((game: GameBase) => game.clearGameData());
        this.gameIds.forEach((gameId: number) => {
            this.socketIOController.closeSocket(gameId);
        });
    }

    onEnable() {
        if (this.isGameOpened) {
            this.reConnectSockets();
            this.initLocations();
            this.initMultiplayLayout();
        }
        this.isGameOpened = true;
        this.bgShadow && (this.bgShadow.active = true);

        const gameSetting = GameUtils.getSpecificGameSetting(this.gameId);
        this.collapsedExpandButton.isChecked = gameSetting.openSubGames ?? true;
        this.showHideSubAreas(false);
        this.promotionGuideComp && this.promotionGuideComp.showGuide();
    }

    onDisable() {
        Object.values(this.games).forEach((game: GameBase) => game.cleanGame());
        this.promotionGuideComp && this.promotionGuideComp.hideGuide();
    }

    initSockets() {
        this.gameIds.forEach((gameId) => {
            if (gameId === this.gameId) {
                return;
            }
            let socket = this.socketIOController.getSocketGame(gameId);
            const gameName = GameUtils.getGameNameString(gameId);
            if (!socket) {
                socket = this.currentMiniPanel.gameMiniInitializers.createMiniGameSocket(gameId, false);
                this.currentMiniPanel.gameMiniInitializers.initMiniGameSocketListeners(socket, gameId, gameName, null);
            } else {
                socket.removeAllListeners();
                this.currentMiniPanel.gameMiniInitializers.initMiniGameSocketListeners(socket, gameId, gameName, null);
                socket.connect();
            }

            socket.on("signedIn", () => {
                this.initForSingle(gameId);
            });
        });
        this.initForDefaultGame();
    }

    initForDefaultGame() {
        this.initForSingle(this.gameId);
    }

    grantSocketForSingle(gameId: number) {
        const multiplaySingle = this.games[gameId] as GameBase;
        multiplaySingle.grantSocket();
        multiplaySingle.initSocketListener();
        multiplaySingle.startGame();
        return multiplaySingle;
    }

    initForSingle(gameId: number) {
        const multiplaySingle = this.grantSocketForSingle(gameId);
        multiplaySingle.clearAllData();
        multiplaySingle.registerViewGame();
    }

    reConnectSockets() {
        this.gameIds.forEach((gameId) => {
            if (gameId === this.gameId) {
                return;
            }
            const socket = this.socketIOController.getSocketGame(gameId);
            if (socket && !socket.connected) {
                socket.connect();
            }
        });
        this.initForDefaultGame();
    }

    initLocations() {
        const gameSetting = GameUtils.getSpecificGameSetting(this.gameId);
        if (!gameSetting.locations) {
            const locations = {};
            this.gameIds.forEach((id, index) => (locations[id] = index - 1));
            gameSetting.locations = locations;
            GameUtils.setSpecificGameSetting(this.gameId, gameSetting);
        }
        this.locations = gameSetting.locations;
    }

    initMultiplayLayout() {
        this.gameIds.forEach((gameId) => {
            const location = this.locations[gameId];
            if (location === ItemSlot.Main) {
                this.addMainGameUI(gameId);
            } else {
                this.addSubGameUI(gameId, location);
            }
        });
    }

    addMainGameUI(gameId: number) {
        const child = this.mainContent.children[0];
        if (child) {
            const game = child.getComponent(GameBase);
            this.gamesState[game.gameId] = game.gameState || GameState.None;
            game?.removeGameDataEvents();
            child.destroy();
        }
        this.mainContent.addChild(this.createMainGameUI(gameId));
        this.locations[gameId] = ItemSlot.Main;
        this.mainGameId = gameId;
    }

    assignPropertiesForSingle(single: any, isMain: boolean, gameId: number) {
        single.currentMiniPanel = this.currentMiniPanel;
        single.betChips = this.betChips;
        single.isCollectChip = isMain;
        single.groupDefaultGameId = this.gameId;
        single.callbackWinningResult = this.callbackWinningResult;
        single.callbackWinningStreak = this.callbackWinningStreak;
        const oldCheckShowUmMessage = single?.checkShowUmMessage?.bind(single);
        single.checkShowUmMessage = (data) => this.checkShowUmMessage(oldCheckShowUmMessage, gameId, data);
    }

    checkShowUmMessage(baseFunc: any, gameId: number, data: any) {
        return baseFunc?.(data) || this.gamesState[gameId] === GameState.Disabled;
    }

    createMainGameUI(gameId: number) {
        const node = cc.instantiate(this.normallPrefab);
        const single = node.getComponent(GameBase);
        this.assignPropertiesForSingle(single, true, gameId);

        this.games[gameId] = single;
        single.onDisconnectCallback = () => {
            this.onDisconnected();
        };
        return node;
    }

    onDisconnected() {
        this.onCloseClick();
    }

    addSubGameUI(gameId: number, location: number) {
        if (location < 0) {
            return null;
        }
        const content = this.subContents[location];
        const child = content.children[0];
        if (child) {
            const game = child.getComponent(GameBase);
            this.gamesState[game.gameId] = game.gameState || GameState.None;
            game?.removeGameDataEvents();
            child.destroy();
        }
        const subGameNode = this.createSubGameUI(gameId, location);
        content.addChild(subGameNode);
        this.locations[gameId] = location;
        return subGameNode;
    }

    createSubGameUI(gameId: number, location: number) {
        const node = cc.instantiate(this.smallPrefab);
        const single = node.getComponent(GameBase);
        single.maximizeCallback = (gameId) => this.switchGameToMain(gameId);
        this.assignPropertiesForSingle(single, false, gameId);
        this.games[gameId] = single;
        return node;
    }

    switchGameToMain(gameId: number) {
        const lastMainGameId = this.mainGameId;
        const lastSubGameSlot = this.locations[gameId];
        this.addMainGameUI(gameId);
        this.addSubGameUI(lastMainGameId, lastSubGameSlot);

        [this.mainGameId, lastMainGameId].forEach((id) => {
            const game = this.grantSocketForSingle(id);
            game.currentBet = this.currentBet;
            game.gameData?.updateUI();
        });

        GameUtils.setSubGameSetting(this.gameId, "locations", this.locations);
    }

    initBetChipByLoader(node: cc.Node) {
        this.betChips = node.getComponent(BetChips);
        Object.values(this.games).forEach((game: GameBase) => {
            game.betChips = this.betChips;
        });
        this.betChips.init((bet) => {
            this.onChangedBetChip(+bet);
        });
    }

    onChangedBetChip(bet: number) {
        this.currentBet = bet;
        Object.values(this.games).forEach((game: GameBase) => (game.currentBet = bet));
    }

    setGameConfigs(gameConfigs: any) {
        if (this.betChips) {
            this.betChips.setChipValues(gameConfigs);
        }
    }

    onCloseClick() {
        AudioManager.getInstance().playClick();
        this.node.active = false;
        this.resetStatisticShow();
        this.currentMiniPanel.onGamesLayerChanged();
    }

    handleSubGamesArea() {
        this.showHideSubAreas();
        this.storeStatusSubGameArea();
    }

    storeStatusSubGameArea() {
        const gameSetting = GameUtils.getSpecificGameSetting(this.gameId);
        gameSetting.openSubGames = this.collapsedExpandButton.isChecked;
        GameUtils.setSpecificGameSetting(this.gameId, gameSetting);
    }

    showSubGamesWithAnimation(isAnimated = true) {
        this.bgShadow && (this.bgShadow.active = true);
        if (isAnimated) {
            this.subGamesArea.forEach((node: cc.Node) => {
                cc.tween(node).to(0.3, { scale: 1 }, { easing: "sineOut" }).start();
            });
        } else {
            this.subGamesArea.forEach((node: cc.Node) => {
                node.scale = 1;
            });
        }
    }

    hideSubGamesWithAnimation(isAnimated = true) {
        this.bgShadow && (this.bgShadow.active = false);
        if (isAnimated) {
            this.subGamesArea.forEach((node: cc.Node) => {
                cc.tween(node).to(0.2, { scale: 0 }, { easing: "sineIn" }).start();
            });
        } else {
            this.subGamesArea.forEach((node: cc.Node) => {
                node.scale = 0;
            });
        }
    }

    private storageStatusStatistic(status: boolean) {
        GameUtils.setSubGameSetting(this.gameId, KeyStorageStatisticOpen, status);
    }

    resetStatisticShow() {
        GameUtils.setSubGameSetting(this.gameId, KeyStorageStatisticOpen, true);
    }

    initPromotionGuide(node: cc.Node) {
        this.promotionGuideComp = node.getComponent(MultiplayPromotionGuide);
        this.promotionGuideComp.addComponent(DraggableItem).targetNode = this.node;
    }

    showHideSubAreas(animated = true) {
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            game_name: GameUtils.getGameNameString(this.gameId),
            action: this.collapsedExpandButton.isChecked ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
            object_name: "Show SubGames"
        });

        this.collapsedExpandButton.isChecked ? this.showSubGamesWithAnimation(animated) : this.hideSubGamesWithAnimation(animated);
    }

    onScoreBoardClick() {
        AudioManager.getInstance().playClick();
        const node = cc.instantiate(this.scoreBoardPrefab);
        this.currentMiniPanel.addDialog(node);

        const scoreBoard = node.getComponent(MultiplayScoreBoard);
        scoreBoard.init(this.games);
        scoreBoard.openGameCallback = (gameId) => {
            this.switchGameToMain(gameId);
        };
    }
}
