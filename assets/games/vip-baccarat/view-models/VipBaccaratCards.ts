import BaccaratCards from "../../baccarat/view-models/BaccaratCards";

const { ccclass } = cc._decorator;

@ccclass
export default class VipBaccaratCards extends BaccaratCards {
    resetCard(card: cc.Node) {
        super.resetCard(card);
    }

    flyCardTmp1() {
        this.flyCard(this.cardsTmp[0], 0.5);
    }

    flyCardTmp2() {
        this.flyCard(this.cardsTmp[1], 0.5);
    }
}
