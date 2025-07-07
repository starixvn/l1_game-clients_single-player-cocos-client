import MiniGameBase from "../../games/_base_new/view-models/MiniGameBase";
import AudioManager from "../audio/AudioManager";
import GameIdSprite from "../GameIdSprite";
import StatisticBoard from "./StatisticBoard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultipleStatisticBoard extends cc.Component {
    @property(GameIdSprite)
    gameName: GameIdSprite = null;

    statisticBoards: StatisticBoard[] = [];
    gameId: number;
    openGameCallback = (gameId) => {};

    onClickSwitchView() {
        AudioManager.getInstance().playClick();
        this.switchView();
    }

    onClickOpenGame() {
        AudioManager.getInstance().playClick();
        this.openGameCallback(this.gameId);
    }

    init(game: MiniGameBase) {
        this.statisticBoards.forEach((statistic) => {
            statistic.init(game);
        });
        this.gameId = game.gameId;
        this.gameName.prefix = `game-name-${window.i18n.curLang}-`;
        this.gameName.gameId = this.gameId;
    }

    onInitializeBigSmallStatisticBoard(node: cc.Node) {
        const statisticBoard = node.getComponent(StatisticBoard);
        statisticBoard.setSupportChoices("big,small");
        this.storeStatisticBoards(node, statisticBoard);
    }

    onInitializeEvenOddStatisticBoard(node: cc.Node) {
        const statisticBoard = node.getComponent(StatisticBoard);
        statisticBoard.setSupportChoices("even,odd");
        this.storeStatisticBoards(node, statisticBoard);
    }

    storeStatisticBoards(node: cc.Node, statisticBoard: StatisticBoard) {
        if (statisticBoard) {
            if (this.statisticBoards.length > 0) {
                node.active = false;
            }
            this.statisticBoards.push(statisticBoard);
        }
    }

    switchView() {
        this.statisticBoards.forEach((board) => (board.node.active = !board.node.active));
    }
}
