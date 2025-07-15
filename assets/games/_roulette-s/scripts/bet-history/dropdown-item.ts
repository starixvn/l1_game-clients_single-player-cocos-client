const { ccclass, property } = cc._decorator;

export interface IDropdownItem {
    value: string;
    text: string;
}

@ccclass
export default class DropdownItem extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Node)
    background: cc.Node = null;

    value: string = null;
    selectItem: () => void = null;

    setData(item: IDropdownItem) {
        this.label.string = item.text;
        this.value = item.value;
        this.background.active = false;
    }

    onSelect() {
        this.selectItem();
    }

    setBackgroundActive(isActive: boolean) {
        this.background.active = isActive;
    }
}
