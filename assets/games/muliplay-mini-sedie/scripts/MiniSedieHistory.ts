import { i18n } from "../../../ClientModules";
import GameUtils from "../../../common/GameUtils";
import NewDropDownOption from "../../../common/new-drop-down-list/view-models/NewDropDownOption";
import DropdownListMultiplayGameHistory from "../../multiplay/scripts/DropdownListMultiplayGameHistory";
import { MiniSedie1Id, MiniSedie2Id, MiniSedie3Id, MiniSedie4Id } from "./MiniSedieConfigs";
import MultiplaySedieHistoryItem from "./MiniSedieHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniSedieHistory extends DropdownListMultiplayGameHistory {
    protected readonly options: NewDropDownOption[] = [
        new NewDropDownOption(DropdownListMultiplayGameHistory.AllGameHistory, i18n.t("ui.all")),
        new NewDropDownOption(MiniSedie1Id, GameUtils.getGameNameString(MiniSedie1Id)),
        new NewDropDownOption(MiniSedie2Id, GameUtils.getGameNameString(MiniSedie2Id)),
        new NewDropDownOption(MiniSedie3Id, GameUtils.getGameNameString(MiniSedie3Id)),
        new NewDropDownOption(MiniSedie4Id, GameUtils.getGameNameString(MiniSedie4Id))
    ];

    bindItemRowData(betLog, index) {
        super.bindItemRowData(betLog, index);
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(MultiplaySedieHistoryItem);
        item.setData(betLog, index);
        this.content.addChild(itemNode);
    }
}
