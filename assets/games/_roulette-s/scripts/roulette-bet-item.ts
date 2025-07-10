import AudioManager from "../../../common/audio/AudioManager";
import {  formatBetAmount, formatOddsWithX } from "../../../common/helpers/NumberHelper";
import BetItem from "../../_base/view-models/BetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteBetItem extends BetItem {

    @property(cc.Node)
    inactiveNode: cc.Node = null;

   
    public betCallback = (choice: string) => {};


    resetUI() {
        this.odds && (this.odds.string = "");
        this.clearBet();
    }

    clearChips() {
        this.chipNode?.destroyAllChildren();
    }

    clearBet() {
        this.clearOwnBet();
        this.highlight && (this.highlight.active = false);
        this.clearChips();
    }

    clearOwnBet() {
        this.ownBet && (this.ownBet.string = "0");
    }

    clearOwnBetForStraightUp() {
        this.ownBet && (this.ownBet.string = "");
    }

    public setOwnBet(bet: number) {
        if (this.ownBet) {
            this.ownBet.string = bet > 0 ? formatBetAmount(bet) : "";
        }
    }

    public setOdd(value: string) {
        if (this.odds) {
            this.odds.string = formatOddsWithX(value);
        }
    }

    public onBetClick(event: cc.Event.EventTouch) {
        AudioManager.getInstance().playClick();
        const choice = this.node.name;
        this.betCallback(choice);
    }

    setHighlight(highlight: boolean) {
        this.highlight.active = highlight;
    }

    setInactive(inactive: boolean) {
        this.inactiveNode.active = inactive;
    }
}
