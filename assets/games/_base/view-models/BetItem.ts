import AudioManager from "../../../common/audio/AudioManager";
import ColorAssembler2D from "../../../common/ColorAssembler2D";
import GameUtils from "../../../common/GameUtils";
import { formatOdds, numberWithCommas } from "../../../common/helpers/NumberHelper";
import { getLowercaseObjectKeys } from "../../../common/helpers/ObjectHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BetItem extends cc.Component {
    @property(cc.Label)
    totalBet: cc.Label = null;

    @property(cc.Label)
    ownBet: cc.Label = null;

    @property(cc.Label)
    odds: cc.Label = null;

    @property(cc.Node)
    chipNode: cc.Node = null;

    @property(cc.Node)
    highlight: cc.Node = null;

    @property(cc.Node)
    highlightBackground: cc.Node = null;

    @property(cc.Node)
    highlightBorder: cc.Node = null;

    @property(cc.Node)
    normalBorder: cc.Node = null;

    @property
    enabledHighlightOdds = false;

    @property({
        type: cc.Node,
        visible: function () {
            return this.enabledHighlightOdds;
        }
    })
    highlightOddsBackground: cc.Node = null;

    @property
    opacityOdds = 255;

    public betCallback = (e) => {};

    protected setMoneyLabel(label: cc.Label, bet: number) {
        if (label) {
            label.string = bet > 0 ? numberWithCommas(bet, 1) : "";
        }
    }

    public setOwnBet(bet: number) {
        this.setMoneyLabel(this.ownBet, bet);
    }

    public setTotalBet(bet: number) {
        this.setMoneyLabel(this.totalBet, bet);
    }

    public onBetClick(e) {
        AudioManager.getInstance().playClick();
        this.betCallback(e);
    }

    public setTotalBetsData(totalBets: any) {
        const totalBetsKeys = getLowercaseObjectKeys(totalBets);
        const value = totalBets[totalBetsKeys[this.node.name.toLowerCase()]];
        this.setTotalBet(GameUtils.getValueByCurrency(value || 0));
    }

    public setOwnBetsData(ownBets: any) {
        const ownBetsKeys = getLowercaseObjectKeys(ownBets);
        const ownBet = ownBets[ownBetsKeys[this.node.name.toLowerCase()]];
        ownBet && this.setOwnBet(ownBet);
    }

    public setData(data: any) {
        if (data.totalBets) {
            this.setTotalBetsData(data.totalBets);
        }

        if (data.ownBets) {
            this.setOwnBetsData(data.ownBets);
        }
    }

    public setOdd(value: string) {
        if (this.odds) {
            this.odds.string = formatOdds(value);
        }
    }

    public clearChips() {
        this.chipNode.destroyAllChildren();
    }

    public highLightOdds(boostedChoice) {
        const color = cc.Color.WHITE;
        if (boostedChoice && this.enabledHighlightOdds) {
            const highlightOddsColor = this.odds.node.getComponent(ColorAssembler2D);
            this.odds.node.color = color.fromHEX("#FA3A35");
            highlightOddsColor.enabled = true;
            this.enableHighLightOddsBackground(true);
        } else {
            this.odds.node.color = color;
            this.enabledHighlightOdds && this.enableHighLightOddsBackground(false);
        }
    }

    private enableHighLightOddsBackground(enabled = false) {
        this.odds.node.opacity = enabled ? 255 : this.opacityOdds;
        this.highlightOddsBackground.active = enabled;
    }

    public clearBet() {
        if (this.chipNode) {
            this.clearChips();
        }
        this.setOwnBet(0);
        this.setTotalBet(0);
    }

    public setHighlight(highlight: boolean, isAnimated = true) {
        this.setHighlightItems(highlight, isAnimated);
    }

    public resetHighlight() {
        this.setHighlightItems(false);
    }

    protected setHighlightItems(highlight: boolean, isAnimated = true) {
        this.setHighlightCommon(highlight, isAnimated);
        if (this.highlightBorder) {
            this.highlightBorder.active = highlight;
        }
    }

    protected setHighlightCommon(highlight: boolean, isAnimated = true) {
        this.highlight.active = highlight && isAnimated;
        if (this.highlightBackground) {
            this.highlightBackground.active = highlight && isAnimated;
        }
        if (this.normalBorder) {
            this.normalBorder.active = !highlight;
        }
    }

    protected resetHighlightOptions() {
        this.highlight.active = false;
        if (this.highlightBackground) {
            this.highlightBackground.active = false;
        }
    }

    protected setHighlightItemsOptions(highlight: boolean, isAnimated = true) {
        this.setHighlightCommon(highlight, isAnimated);
        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }
    }
}
