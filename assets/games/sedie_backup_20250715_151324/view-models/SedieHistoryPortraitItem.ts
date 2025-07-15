import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import PortraitSedieHistoryBetOption from "./PortraitSedieHistoryBetOption";
import SedieHistoryItem from "./SedieHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieHistoryPortraitItem extends SedieHistoryItem {
    @property(cc.Node)
    betOption: cc.Node = null;

    @property(cc.Prefab)
    betOptionPrefab: cc.Prefab = null;

    @property(cc.Node)
    lineBottom: cc.Node = null;

    private readonly heightEachBetOption = 35;

    setData(betLog: any) {
        const { freeBet, settlementResult, odds } = betLog;

        Object.keys(settlementResult).forEach((choice) => {
            const node = cc.instantiate(this.betOptionPrefab);
            const option = node.getComponent(PortraitSedieHistoryBetOption);
            let stake = betLog[choice];
            if (+stake > 0) {
                stake = freeBet ? 0 : stake;
                option.handleBetOptionItem(choice, numberWithCommas(odds[choice], 2), numberWithCommas(stake));
                option.highlightForWinning(settlementResult[choice]);
                this.betOption.addChild(node);
            }

            GameUtils.setFontSizeLabelsInNode(node);
        });
        this.setSizeAndPosition(this.betOption);
    }
    setSizeAndPosition(betOption: cc.Node) {
        if (betOption.children.length >= 2) {
            this.node.height = this.betOption.children.length * this.heightEachBetOption;
        }
    }
}
