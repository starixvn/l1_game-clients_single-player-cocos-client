import CardLayout from "../../../../../common/new-card/view-models/CardLayout";

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

const { ccclass, property, executeInEditMode, menu } = cc._decorator;
@ccclass
@executeInEditMode
export default class HoldemPokerHandPlace extends cc.Component {
    @property(CardLayout)
    cardLayout: CardLayout = null;

    @property
    _selected = false;

    @property
    get Selected() {
        return this._selected;
    }

    async SetSelected(value) {
        this._selected = value;
        await this.updateDisplay();
    }

    private data: HandModel = null;

    get isActive() {
        return this.data != null;
    }

    get idValue() {
        return this.data.id;
    }

    async updateDisplay() {
        this.cardLayout.shadow.active = this._selected;
        await this.cardLayout.changeCardView(this._selected);
    }

    setData(data: HandModel) {
        this.data = { ...data };
    }

    clearData() {
        this.data = null;
    }

    addCard(card: cc.Node) {
        this.cardLayout.content.addChild(card, 1000); //make sure higher zIndex
    }

    getCards(): cc.Node[] {
        return this.cardLayout.content.children;
    }
}
