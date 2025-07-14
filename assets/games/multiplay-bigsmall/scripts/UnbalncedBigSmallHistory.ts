import UnbalncedBigSmallHistoryItem from "./UnbalncedBigSmallHistoryItem";
import DropdownListMultiplayGameHistory from "../../multiplay/scripts/DropdownListMultiplayGameHistory";
import NewDropDownOption from "../../../common/new-drop-down-list/view-models/NewDropDownOption";
import { UnbalancedBigSmall1Id, UnbalancedBigSmall2Id, UnbalancedBigSmall3Id, UnbalancedBigSmall4Id } from "./UnbalancedBigSmallConfig";
import GameUtils from "../../../common/GameUtils";
import { i18n } from "../../../ClientModules";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnbalncedBigSmallHistory extends DropdownListMultiplayGameHistory {
    protected readonly options: NewDropDownOption[] = [
        new NewDropDownOption(DropdownListMultiplayGameHistory.AllGameHistory, i18n.t("ui.all")),
        new NewDropDownOption(UnbalancedBigSmall1Id, GameUtils.getGameNameString(UnbalancedBigSmall1Id)),
        new NewDropDownOption(UnbalancedBigSmall2Id, GameUtils.getGameNameString(UnbalancedBigSmall2Id)),
        new NewDropDownOption(UnbalancedBigSmall3Id, GameUtils.getGameNameString(UnbalancedBigSmall3Id)),
        new NewDropDownOption(UnbalancedBigSmall4Id, GameUtils.getGameNameString(UnbalancedBigSmall4Id))
    ];

    bindItemRowData(betLog, index) {
        super.bindItemRowData(betLog, index);
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(UnbalncedBigSmallHistoryItem);
        item.setData(betLog, index);
        this.content.addChild(itemNode);
    }
}
