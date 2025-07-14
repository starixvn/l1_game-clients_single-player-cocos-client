import HoldemPokerArrow from "./HoldemPokerArrow";
import NewCard from "../../../../../common/new-card/view-models/NewCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HoldemPokerCard extends NewCard {
    @property(cc.Node)
    bgWhiteFaceDown: cc.Node = null;

    @property(cc.Node)
    borderCard: cc.Node = null;

    @property(HoldemPokerArrow)
    arrowTop: HoldemPokerArrow = null;

    @property(HoldemPokerArrow)
    arrowBot: HoldemPokerArrow = null;

    private defaultSizeBgW: number = null;
    private defaultSizeBgH: number = null;

    showArrow(position: string, whose: string) {
        switch (position) {
            case "top":
                this.arrowTop.updateStateArrow(whose);
                this.arrowTop.node.active = true;
                break;
            case "bot":
                this.arrowBot.updateStateArrow(whose);
                this.arrowBot.node.active = true;
                break;
        }
    }
    hideAllArrow() {
        this.arrowTop.node.active = false;
        this.arrowBot.node.active = false;
    }

    onLoad() {
        super.onLoad();

        this.defaultSizeBgW = this.image.node.width;
        this.defaultSizeBgH = this.image.node.height;
    }

    getCard() {
        return this.card;
    }

    setFaceUp(faceUp: boolean) {
        super.setFaceUp(faceUp);
        if (faceUp && this.card) {
            this.borderCard.active = true;
            this.bgWhiteFaceDown.active = false;
        }
    }

    protected showCardBack() {
        super.showCardBack();
        this.borderCard.active = false;
        this.bgWhiteFaceDown.active = true;
    }
}
