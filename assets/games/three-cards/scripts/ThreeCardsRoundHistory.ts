import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import { ThreeCardsRoundData } from "./DataDefinition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsRoundHistory extends cc.Component {
    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property(cc.Node)
    statsContainer: cc.Node = null;

    statsLabels: cc.Label[] = [];

    onLoad() {
        this.statsContainer.children.forEach((child) => {
            const label = child.getComponent(cc.Label);
            this.statsLabels.push(label);
        });
    }

    setData(rounds: ThreeCardsRoundData[]) {
        const logControlData = [];
        const dataCount = rounds.length;
        let redCount = 0;
        const listCount = {
            diamonds: 0,
            hearts: 0,
            clubs: 0,
            spades: 0
        };
        const keys = Object.keys(listCount);

        rounds.forEach((round) => {
            if (round.settlementResult.red) {
                logControlData.push(0);
                redCount++;
            } else {
                logControlData.push(1);
            }

            const result = round.result;
            const suitKeys = ["hearts", "diamonds", "clubs", "spades"];
            result.forEach((card) => {
                const key = suitKeys[card.suit];
                if (round.settlementResult[key]) {
                    listCount[key] = listCount[key] + 1;
                }
            });
        });

        const redValue = Math.round((redCount * 100) / dataCount);
        const blackValue = 100 - redValue;
        this.statsLabels.find((label) => label.node.name === "red").string = `${redValue}%`;
        this.statsLabels.find((label) => label.node.name === "black").string = `${blackValue}%`;

        const list = keys.map((key) => {
            return { key: key, value: listCount[key] };
        });

        list.forEach((l) => {
            const key = l.key;
            this.statsLabels.find((label) => label.node.name === key).string = `${l.value}`;
        });

        logControlData.reverse();
        this.logControl && this.logControl.setData(logControlData);
    }
}
