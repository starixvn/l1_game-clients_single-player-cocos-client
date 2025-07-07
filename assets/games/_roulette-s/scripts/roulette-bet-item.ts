import AudioManager from "../../../common/audio/AudioManager";
import { formatOdds, numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteBetItem extends cc.Component {
    @property(cc.Label)
    ownBet: cc.Label = null;

    @property(cc.Label)
    odds: cc.Label = null;

    @property(cc.Node)
    chipNode: cc.Node = null;

    @property(cc.Node)
    highlight: cc.Node = null;

    @property
    isGroupBet = false;

    public betCallback = (choice: string) => {};

    private setMoneyLabel(label: cc.Label, bet: number) {
        if (label) {
            label.string = bet > 0 ? numberWithCommas(bet, 1) : "";
        }
    }

    resetUI() {
        this.odds && (this.odds.string = "");
        this.clearBet();
    }

    clearChips() {
        this.chipNode?.destroyAllChildren();
    }

    clearBet() {
        this.ownBet && (this.ownBet.string = "");
        this.highlight && (this.highlight.active = false);
        this.clearChips();
    }

    public setOwnBet(bet: number) {
        this.setMoneyLabel(this.ownBet, bet);
    }

    public setOdd(value: string) {
        if (this.odds) {
            this.odds.string = formatOdds(value);
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
}
