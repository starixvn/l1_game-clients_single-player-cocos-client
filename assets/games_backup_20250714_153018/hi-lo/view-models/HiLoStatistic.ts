import GameUtils from "../../../common/GameUtils";
import { CardModel } from "../../../common/new-card/view-models/NewCard";
import HiLoCard from "../components/view-models/HiLoCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoStatistic extends cc.Component {
    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;

    @property(cc.Node)
    statisticContainer: cc.Node = null;

    @property(cc.ScrollView)
    statsScrollView: cc.ScrollView = null;

    layout: cc.Layout;
    public spaceX: number;
    private readonly itemSize = 10;
    private readonly cardWidth = 145;
    private readonly cardScaleX = 0.29;
    private readonly cardScaleY = 0.29;

    onLoad() {
        this.layout = this.statisticContainer.getComponent(cc.Layout);
        this.spaceX = this.layout.spacingX;
    }

    onEnable() {
        this.statisticContainer.getComponent(cc.Widget).left = 0;
    }

    clearCards() {
        this.statisticContainer.destroyAllChildren();
    }

    updateCards(cards: CardModel[]) {
        this.clearCards();
        cards.forEach((card) => {
            this.createCard(card);
        });

        this.updatePositionHighlight();

        if (cards.length > this.itemSize) {
            this.updateContentPosition(this.getOffsetX(cards.length - this.itemSize));
        }

        this.layout && this.layout.updateLayout();
    }

    updatePositionHighlight() {
        const cardComps = this.statisticContainer.getComponentsInChildren(HiLoCard);
        cardComps.forEach((comp, index) => {
            comp.highlight.active = index === cardComps.length - 1;
        });
    }

    private getOffsetX(itemNumbers: number): number {
        return -this.statsScrollView.node.width / 2 - itemNumbers * (this.cardWidth * this.cardScaleX + this.spaceX);
    }

    updateContentPosition(offsetX: number) {
        cc.tween(this.statisticContainer)
            .to(
                0.3,
                { position: cc.v3(offsetX, this.statisticContainer.position.y, this.statisticContainer.position.z) },
                { easing: "sineOut" }
            )
            .start();
    }

    createCard(card: CardModel): cc.Node {
        const cardNode = GameUtils.createNodeFromPrefab(this.cardPrefab);
        cardNode.scaleX = this.cardScaleX;
        cardNode.scaleY = this.cardScaleY;
        this.statisticContainer.addChild(cardNode);
        const cardComp = cardNode.getComponent(HiLoCard);
        cardComp.setCard(card);
        cardComp.faceUp();

        return cardNode;
    }
}
