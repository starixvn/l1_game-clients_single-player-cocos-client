import { getStringDate } from "../../../../common/helpers/DateTimeHelper";
import DropdownItem, { IDropdownItem } from "./dropdown-item";

const { ccclass, property } = cc._decorator;

export enum DropdownEvents {
    SELECT_ITEM = "select_item"
}
@ccclass
export default class Dropdown extends cc.Component {
    @property(cc.Node)
    scrollView: cc.Node = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    @property(cc.Label)
    selectedLabel: cc.Label = null;

    @property(cc.Node)
    iconExpand: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    selectedItem: IDropdownItem = null;
    selectedValue = "";
    dropdownItems: DropdownItem[] = [];
    scrollViewHeight = 291;
    isExpand = false;

    onLoad() {
        const data = this.initData();
        data.forEach((item) => {
            const itemNode = cc.instantiate(this.itemPrefab);
            const dropdownItem = itemNode.getComponent(DropdownItem);
            dropdownItem.setData(item);
            this.contentNode.addChild(itemNode);
            dropdownItem.setBackgroundActive(this.selectedValue === item.value);
            dropdownItem.selectItem = this.onSelectItem.bind(this, item);
            this.dropdownItems.push(dropdownItem);
        });
        this.scrollView.active = true;
        this.scrollView.scaleY = 0;
    }

    initData() {
        const data = Array.from({ length: 7 }, (_, index) => {
            const date = this.getDateFromDaysAgo(index);
            return {
                value: date,
                text: getStringDate(date)
            };
        });
        data.unshift({ value: "", text: "All" });
        return data;
    }

    getDateFromDaysAgo(daysAgo: number): string {
        const now = new Date();
        now.setDate(now.getDate() - daysAgo);
        return new Date(now.setHours(0, 0, 0, 0)).toString();
    }

    onSelectItem(item: IDropdownItem) {
        this.dropdownItems.forEach((dropdownItem) => {
            dropdownItem.setBackgroundActive(dropdownItem.value === item.value);
        });
        this.selectedItem = item;
        this.selectedLabel.string = item.text;
        this.selectedValue = item.value;
        this.onExpand();
        this.node.emit(DropdownEvents.SELECT_ITEM, item.value);
    }

    onExpand() {
        this.isExpand = !this.isExpand;
        this.iconExpand.scaleX = this.isExpand ? -1 : 1;
        const scaleY = this.isExpand ? 1 : 0;
        cc.tween(this.scrollView).to(0.1, { scaleY }).start();
    }
}
