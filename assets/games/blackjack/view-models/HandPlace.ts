import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import CardLayout from "../../../common/new-card/view-models/CardLayout";
import { CardModel } from "../../../common/new-card/view-models/NewCard";
import BlackJackUtils from "./BlackJackUtils";

export interface HandModel {
    id: string;
    pos: number;
    bet: number;
    total: any;
    isStand: boolean;
    cards: any[];
    splitFrom: boolean;
    actions: string[];
}

const { ccclass, property, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
export default class HandPlace extends cc.Component {
    @property(cc.Button)
    betPlace: cc.Button = null;

    @property(CardLayout)
    cardLayout: CardLayout = null;

    @property(cc.Node)
    clearBetButton: cc.Node = null;

    @property(cc.Label)
    betValue: cc.Label = null;

    @property(cc.Label)
    scoreValue: cc.Label = null;

    @property(cc.Label)
    resultValue: cc.Label = null;

    @property(cc.Label)
    handId: cc.Label = null;

    @property(cc.Node)
    blackJackNode: cc.Node = null;

    @property(cc.Node)
    burstNode: cc.Node = null;

    @property(cc.Node)
    errorNode: cc.Node = null;

    @property(cc.Node)
    betText: cc.Node = null;

    @property(cc.Node)
    activeIcon: cc.Node = null;

    @property
    _selected = false;

    @property
    get selected() {
        return this._selected;
    }

    set selected(value) {
        this._selected = value;
        this.updateDisplay(value);
    }

    protected data: HandModel = null;

    get isStand() {
        return this.data.isStand;
    }

    get canSplit() {
        const cards = this.data.cards;
        if (cards.length !== 2) {
            return false;
        }

        const firstValues = BlackJackUtils.getValues(cards[0].rank);
        const secondValues = BlackJackUtils.getValues(cards[1].rank);
        let isEqual = false;
        for (const value of firstValues) {
            if (secondValues.includes(value)) {
                isEqual = true;
                break;
            }
        }

        return isEqual && !this.isSplit;
    }

    get isSplit() {
        return this.data.splitFrom || this.data.actions.includes("split");
    }

    get canDouble() {
        const cards = this.data.cards;
        if (cards.length !== 2) {
            return false;
        }

        const total = this.data.total[0];
        return total > 8 && total < 12 && !this.isSplit;
    }

    get isActive() {
        return this.data != null;
    }

    get idValue() {
        return this.data.id;
    }

    private _betAmount = 0;
    public betItemClickCallback = () => {};
    public clearBetClickCallback = (checkExistChip) => {};
    private scoreFrame: cc.Node = null;

    onLoad() {
        this.resetView();
    }

    resetView() {
        if (this.clearBetButton) {
            this.clearBetButton.on("click", this.onClearBetClick, this);
            this.clearBetButton.active = false;
        }

        this.showBetValue(false);
        this.showScore(false);
        this.handId && this.showHandId(false);
        this.resultValue && this.showResult(false);
        this.blackJackNode.active = false;
        this.burstNode.active = false;
        if (this.errorNode) {
            this.errorNode.active = false;
        }
        if (this.betText) {
            this.betText.active = true;
        }

        if (this.activeIcon) {
            this.activeIcon.active = false;
        }
        this.scoreFrame = this.scoreValue.node.parent;
    }

    updateDisplay(selected: boolean) {
        const moveDistance = 50;
        const selectedColorToHEXValue = "a8ff7e";

        this.cardLayout.shadow.active = this.selected;
        this.cardLayout.changeCardView(this.selected);

        if (selected) {
            this.activeIcon.active = true;

            if (!this.activeIcon.getActionByTag(10)) {
                const action = cc.repeatForever(
                    cc.sequence(
                        cc.moveTo(0.4, cc.v2(-35, 0)).easing(cc.easeSineIn()),
                        cc.delayTime(0.1),
                        cc.moveTo(0.4, cc.v2(-25, 0)).easing(cc.easeSineOut())
                    )
                );
                this.activeIcon.runAction(action).setTag(10);
            }

            if (this.scoreFrame.color.toHEX("#rrggbb") !== selectedColorToHEXValue) {
                cc.tween(this.scoreFrame)
                    .to(0.3, { position: cc.v2(this.scoreFrame.x, this.scoreFrame.y + moveDistance) })
                    .start();
            }

            this.scoreFrame.color = new cc.Color(168, 255, 126);
            this.scoreValue.node.color = new cc.Color(26, 255, 20);
        } else {
            this.activeIcon.stopAllActions();
            this.activeIcon.active = false;
            this.scoreFrame.color = cc.Color.BLACK;
            this.scoreValue.node.color = new cc.Color(192, 192, 192);
            cc.tween(this.scoreFrame)
                .to(0.3, { position: cc.v2(this.scoreFrame.x, this.scoreFrame.y - moveDistance) })
                .start();
        }
    }

    setData(data: HandModel) {
        this.data = { ...data };
        this.setHandId(this.data.id);
    }

    clearData() {
        this.data = null;
    }

    onBetItemClick() {
        this.betItemClickCallback();
    }

    onClearBetClick(checkExistChip = true) {
        this.resetView();
        this.clearBetAmount();
        this.clearData();
        this.clearBetClickCallback(checkExistChip);
    }

    getBetAmount(): number {
        return this._betAmount;
    }

    addBetAmount(amount: number) {
        this._betAmount += amount;
        this.updateDisplayBetValue(this._betAmount);
    }

    clearBetAmount() {
        this._betAmount = 0;
    }

    addCard(card: cc.Node) {
        this.cardLayout.content.addChild(card, 1000); //make sure higher zIndex
    }

    getCards(): cc.Node[] {
        return this.cardLayout.content.children;
    }

    showBetValue(show: boolean) {
        if (this.betValue) {
            this.betValue.node.parent.active = show;
        }
    }

    updateDisplayBetValue(bet?: number) {
        this.showBetValue(true);
        this.betValue.string = numberWithCommas(bet ? bet : this._betAmount);
    }

    syncBetValue() {
        this.updateDisplayBetValue(this.data.bet);
        this._betAmount = this.data.bet;
    }

    showScore(show: boolean) {
        this.scoreValue.node.parent.active = show;
    }

    updateDisplayScore(final: boolean, isBlackjack = false) {
        if (!this.data) {
            this.scoreValue.string = "";
            this.showScore(false);
            return;
        }
        this.showScore(true);
        if (final) {
            if (this.data.isStand) {
                const total = this.data.total[this.data.total.length - 1];
                this.scoreValue.string = total;
                this.showExtraInfoHandPlace(this.data.cards, total);
            } else {
                this.scoreValue.string = this.data.total.join(" / ");
            }
        } else {
            const card = this.data.cards[0];
            const values = BlackJackUtils.getValues(card.rank);
            this.scoreValue.string = values.join(" / ");
        }
    }

    showExtraInfoHandPlace(cards: CardModel[], total: number) {
        if (total > 21) {
            this.burstNode.active = true;
            this.showScore(false);
        } else if (this.isBlackJackHandPlace(cards, total)) {
            this.blackJackNode.active = true;
            this.showScore(false);
        }
    }

    isBlackJackHandPlace(cards: CardModel[], total: number): boolean {
        return total === 21 && cards.length === 2 && !this.isSplit;
    }

    showScoreWithOutData(cards: CardModel[], cardNum: number, final = false) {
        this.showScore(true);
        const values = BlackJackUtils.getTotal(cards, cardNum);
        if (final) {
            const total = values[values.length - 1];
            this.scoreValue.string = total.toString();
            this.showExtraInfoDealerPlace(cards, total);
        } else {
            this.scoreValue.string = values.join(" / ");
        }
    }

    showExtraInfoDealerPlace(cards: CardModel[], total: number) {
        if (total > 21) {
            this.burstNode.active = true;
            this.showScore(false);
        } else if (total === 21 && cards.length === 2) {
            this.blackJackNode.active = true;
            this.showScore(false);
        }
    }

    showClearBetButton(show: boolean) {
        if (this.clearBetButton) {
            this.clearBetButton.active = show;
        }
    }

    enablePlaceChip(enable: boolean) {
        if (this.betPlace) {
            this.betPlace.interactable = enable;
        }
    }

    highlightPlace(highlight: boolean) {
        if (this.betPlace) {
            this.betPlace.node.children[0].active = highlight;
        }
    }

    showHandId(show: boolean) {
        this.handId.node.active = show;
    }

    setHandId(id: string) {
        this.handId.string = `#${id}`;
        this.showHandId(true);
    }

    showResult(show: boolean) {
        this.resultValue.node.parent.active = show;
    }

    setResult(result: number) {
        this.resultValue.string = `+${numberWithCommas(result)}`;
        this.showResult(true);
    }

    showErrorNotice() {
        if (this.errorNode) {
            this.errorNode.active = true;
            cc.tween(this.errorNode)
                .delay(2.5)
                .call(() => (this.errorNode.active = false))
                .start();
        }
        this.showBetValue(false);
    }

    showBetText(show: boolean) {
        if (this.betText) {
            this.betText.active = show;
        }
    }
}
