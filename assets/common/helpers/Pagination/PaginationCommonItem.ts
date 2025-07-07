const { ccclass, property } = cc._decorator;

@ccclass
export default class PaginationCommonItem extends cc.Component {
    @property(cc.Node)
    bgSelect: cc.Node = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Label)
    number: cc.Label = null;

    @property
    textHighlightColor = cc.Color.BLACK;

    @property
    textNormalColor = cc.Color.WHITE;

    page = 1;

    updateHighlight(highlight: boolean) {
        this.number.node.color = highlight ? this.textHighlightColor : this.textNormalColor;
        this.bg.active = !highlight;
        this.bgSelect.active = highlight;
    }
}
