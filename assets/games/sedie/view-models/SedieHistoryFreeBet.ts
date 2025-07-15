import FreeBetDetail from "./FreeBetDetail";
import SedieHistory from "./SedieHistory";
import SedieHistoryItemFreeBet from "./SedieHistoryItemFreeBet";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieHistoryFreeBet extends cc.Component {
    @property(cc.Prefab)
    freeBetDetailPrefab: cc.Prefab = null;

    @property(SedieHistory)
    sedieHistory: SedieHistory = null;

    onLoad() {
        this.sedieHistory.onUpdatedData = () => this.updateClickItems();
    }

    updateClickItems() {
        this.sedieHistory.content.children.forEach((node) => {
            const item = node.getComponent(SedieHistoryItemFreeBet);
            item.linkContainerButton.node.on("click", () => this.showFreeBetDetail(item.betLog));
        });
    }

    showFreeBetDetail(betLog) {
        const freeBetDetailNode = cc.instantiate(this.freeBetDetailPrefab);
        const freeBetDetail = freeBetDetailNode.getComponent(FreeBetDetail);
        this.node.addChild(freeBetDetailNode);
        freeBetDetail.init(betLog);
    }
}
