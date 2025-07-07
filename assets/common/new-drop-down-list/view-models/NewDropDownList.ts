import GameUtils from "../../GameUtils";
import NewDropDownItem from "./NewDropDownItem";
import NewDropDownOption from "./NewDropDownOption";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewDropDownList extends cc.Component {
    @property(cc.Prefab)
    prefabItem: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    optionContainer: cc.Node = null;

    @property(cc.Label)
    captionLabel: cc.Label = null;

    private options: NewDropDownOption[] = [];

    public onSelectedItemChanged: (itemId: number) => void;

    public isOpenDropDown = false;

    public checkLayerCloseDrop = (isShow: boolean) => {};

    onLoad() {
        this.optionContainer.scaleY = 0;
        GameUtils.setFontSizeLabelsInNode(this.node);
    }

    onCaptionClick() {
        if (this.optionContainer.scaleY === 0) {
            this.openDropDown();
            this.isOpenDropDown = true;
        } else {
            this.closeDropDown();
            this.isOpenDropDown = false;
        }
    }

    init(options: NewDropDownOption[], onSelectedItemChanged: (itemId: number) => void) {
        this.options = options;
        this.initListItems();
        this.onSelectedItemChanged = onSelectedItemChanged;

        const selectedOption = this.options[0];
        this.updateCaption(selectedOption);
    }

    protected updateCaption(option: NewDropDownOption) {
        this.captionLabel.string = option.text;
    }

    protected addItem(option: NewDropDownOption) {
        const itemNode = cc.instantiate(this.prefabItem);
        const itemComponent = itemNode.getComponent(NewDropDownItem);
        itemComponent.setData(option);
        itemNode.on(cc.Node.EventType.TOUCH_END, this.onSelectItem, this);
        this.content.addChild(itemNode);
    }

    protected onSelectedOption(option: NewDropDownOption) {
        this.updateCaption(option);
        this.onSelectedItemChanged(option.itemId);
    }

    protected onSelectItem(event: cc.Event.EventTouch) {
        const component = event.currentTarget.getComponent(NewDropDownItem);
        if (component) {
            this.onSelectedOption(component.option);
        }

        this.closeDropDown();
    }

    protected initListItems() {
        this.content && this.content.destroyAllChildren();
        this.options.forEach((option) => {
            this.addItem(option);
        });
    }

    protected openDropDown(animated = true) {
        if (animated) {
            cc.tween(this.optionContainer).to(0.2, { scaleY: 1 }, { easing: "sineInOut" }).start();
        } else {
            this.optionContainer.scaleY = 1;
        }
        this.checkLayerCloseDrop(true);
    }

    closeDropDown(animated = true) {
        if (animated) {
            cc.tween(this.optionContainer).to(0.1, { scaleY: 0 }, { easing: "sineOut" }).start();
        } else {
            this.optionContainer.scaleY = 0;
        }
        this.checkLayerCloseDrop(false);
    }
}
