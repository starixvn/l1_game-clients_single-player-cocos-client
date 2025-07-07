import GameUtils from "../../../common/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameTicketDetailItemBase extends cc.Component {
    @property(cc.Node)
    bg: cc.Node = null;

    start() {
        GameUtils.setFontSizeLabelsInNode(this.node);
    }

    setBackground(index: number) {
        this.bg.active = index % 2 > 0;
    }
}
