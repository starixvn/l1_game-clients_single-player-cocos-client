import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import CascadingSlotTotalMultiplierItem from "./CascadingSlotTotalMultiplierItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingSlotTotalMultiplier extends cc.Component {
    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    totalMultiplierItemPrefab: cc.Prefab = null;

    onLoad() {
        this.commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }

    setData(data: any) {
        const rounds = data.totalMultipliers.rounds;
        rounds.forEach((round, index) => {
            const itemNode = cc.instantiate(this.totalMultiplierItemPrefab);
            const itemControl = itemNode.getComponent(CascadingSlotTotalMultiplierItem);
            itemControl.setData(round, index + 1);
            this.content.addChild(itemNode);
        });
    }
}
