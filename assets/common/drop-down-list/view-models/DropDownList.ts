import DropDownItem from "./DropDownItem";
import DropDownOption from "./DropDownOption";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DropDownList extends cc.Component {
    @property(cc.Prefab)
    prefabItem: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    optionContainer: cc.Node = null;

    @property(cc.Label)
    captionLabel: cc.Label = null;

    private options: DropDownOption[] = [];

    public onSelectedItemChanged: (itemId: number) => void;

    onLoad() {
        this.optionContainer.active = false;
    }

    onCaptionClick() {
        if (!this.optionContainer.active) {
            this.openDropDown();
        } else {
            this.closeDropDown();
        }
    }

    init(options: DropDownOption[], onSelectedItemChanged: (itemId: number) => void) {
        this.options = options;
        this.initListItems();
        this.onSelectedItemChanged = onSelectedItemChanged;

        const selectedOption = this.options[0];
        this.updateCaption(selectedOption);
    }

    closeDropDown() {
        this.optionContainer.active = false;
    }

    protected updateCaption(option: DropDownOption) {
        this.captionLabel.string = option.text;
    }

    protected addItem(option: DropDownOption) {
        const itemNode = cc.instantiate(this.prefabItem);
        const itemComponent = itemNode.getComponent(DropDownItem);
        itemComponent.setData(option);
        itemNode.on(cc.Node.EventType.TOUCH_END, this.onSelectItem, this);
        this.content.addChild(itemNode);
    }

    protected onSelectedOption(option: DropDownOption) {
        this.updateCaption(option);
        this.onSelectedItemChanged(option.itemId);
    }

    protected onSelectItem(event: cc.Event.EventTouch) {
        const component = event.currentTarget.getComponent(DropDownItem);
        if (component) {
            this.onSelectedOption(component.option);
        }

        this.closeDropDown();
    }

    protected initListItems() {
        this.options.forEach((option) => {
            this.addItem(option);
        });
    }

    protected openDropDown() {
        this.optionContainer.active = true;
    }
}
