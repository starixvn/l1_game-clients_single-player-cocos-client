import AudioManager from "../../../common/audio/AudioManager";
import CustomDisplayToggle from "../../../common/custom-button/CustomDisplayToggle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Category extends cc.Component {
    @property(cc.Label)
    categoryName: cc.Label = null;

    @property(cc.Label)
    checkMark: cc.Label = null;

    @property(cc.Node)
    newTag: cc.Node = null;

    @property(cc.Node)
    separator: cc.Node = null;

    private _index: number;

    set Index(index: number) {
        this._index = index;
    }

    get Index() {
        return this._index;
    }

    get CategoryName() {
        return this.categoryName.string;
    }

    set CategoryName(name: string) {
        this.categoryName.string = this.checkMark.string = name?.toUpperCase();
    }

    onCategoryChanged = (e) => {
        // handle
    };

    onClickCategory() {
        AudioManager.getInstance().playClick();
        this.onCategoryChanged(this.Index);
    }

    enabledCategorySeparator(categoryLength: number) {
        this.separator && (this.separator.active = categoryLength !== this._index);
    }

    selectCategory(isSelected: boolean) {
        const toggle = this.getComponent(CustomDisplayToggle);
        toggle.isChecked = isSelected;
    }
}
