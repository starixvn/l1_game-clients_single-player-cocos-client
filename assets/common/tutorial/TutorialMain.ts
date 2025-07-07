import AudioManager from "../audio/AudioManager";
import TutorialItem from "./TutorialItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TutorialMain extends cc.Component {
    @property({ type: cc.Prefab })
    itemPrefabs: cc.Prefab[] = [];

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Sprite)
    dotSlideSprite: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    dotSlideSpriteFrame: cc.SpriteFrame[] = [];

    @property(cc.Node)
    btnNext: cc.Node = null;

    @property(cc.Node)
    btnPrev: cc.Node = null;

    @property(cc.SpriteFrame)
    nextPreSpriteFrame: cc.SpriteFrame[] = [];

    items: TutorialItem[] = [];

    currentIndex = -1;
    timeConfig: number[] = [];

    toggleCallback = (value: boolean) => {
        // toggleCallback
    };

    endSlideCallBack = () => {
        // endSlideCallBack
    };

    onClickNext() {
        this.playClick();
        const index = this.currentIndex + 1;
        if (index < this.items.length) {
            this.showItem(index);
        } else {
            this.hide();
        }
        this.setStatusButtonNextPre(this.currentIndex);
        if (this.dotSlideSprite.length > 0) {
            this.dotSlideSprite[this.currentIndex].spriteFrame = this.dotSlideSpriteFrame[0];
            this.dotSlideSprite[this.currentIndex - 1].spriteFrame = this.dotSlideSpriteFrame[1];
        }
    }

    onClickPrevious() {
        this.playClick();
        const index = this.currentIndex - 1;
        if (index > -1) {
            this.showItem(index);
        } else {
            this.currentIndex = 0;
        }
        this.setStatusButtonNextPre(this.currentIndex);
        if (this.dotSlideSprite.length > 0) {
            this.dotSlideSprite[this.currentIndex].spriteFrame = this.dotSlideSpriteFrame[0];
            this.dotSlideSprite[this.currentIndex + 1].spriteFrame = this.dotSlideSpriteFrame[1];
        }
    }

    onClickSkip() {
        this.playClick();
        this.hide();
    }

    onToggleChanged(toggle: cc.Toggle) {
        this.playClick();

        const checked = toggle.isChecked;
        this.toggleCallback(checked);
    }

    private playClick() {
        AudioManager.getInstance().playClick();
    }

    onLoad() {
        this.initItems();
        this.setStatusButtonNextPre(0);
    }

    onDisable() {
        this.endSlideCallBack && this.endSlideCallBack();
    }

    show() {
        this.showItem(0);
    }

    hide() {
        const currentItem = this.getItem(this.currentIndex);
        currentItem.hide();
        this.endSlideCallBack && this.endSlideCallBack();
        this.node.destroy();
    }

    protected initItems() {
        this.itemPrefabs.forEach((prfab) => {
            const node = cc.instantiate(prfab);
            this.content.addChild(node);
            const item = node.getComponent(TutorialItem);
            this.items.push(item);

            node.active = false;
        });
    }

    private getItem(index: number): TutorialItem {
        if (index === -1 || index >= this.items.length) {
            return null;
        }
        return this.items[index];
    }

    protected showItem(index: number): void {
        this.unscheduleAllCallbacks();
        const currentItem = this.getItem(this.currentIndex);
        if (currentItem) {
            currentItem.hide();
        }
        this.currentIndex = index;
        const nextItem = this.getItem(index);
        nextItem.show();

        if (index > -1 && index < this.items.length) {
            const time = this.timeConfig[index];
            if (time > 0) {
                this.scheduleOnce(this.onClickNext.bind(this), time);
            }
        }
    }

    public setTimeConfig(config: number[]) {
        this.timeConfig = config;
    }

    setStatusButtonNextPre(indexCurrent: number) {
        if (indexCurrent === 0) {
            this.btnPrev.getChildByName("Background") &&
                (this.btnPrev.getChildByName("Background").getComponent(cc.Sprite).spriteFrame = this.nextPreSpriteFrame[0]);
            this.btnPrev.getComponent(cc.Button).enabled = false;
            return;
        }

        if (indexCurrent > this.dotSlideSprite.length - 2) {
            this.btnNext.getChildByName("Background") &&
                (this.btnNext.getChildByName("Background").getComponent(cc.Sprite).spriteFrame = this.nextPreSpriteFrame[0]);
            this.btnNext.getComponent(cc.Button).enabled = false;
            return;
        }
        this.btnPrev.getChildByName("Background") &&
            (this.btnPrev.getChildByName("Background").getComponent(cc.Sprite).spriteFrame = this.nextPreSpriteFrame[1]);
        this.btnNext.getChildByName("Background") &&
            (this.btnNext.getChildByName("Background").getComponent(cc.Sprite).spriteFrame = this.nextPreSpriteFrame[1]);
        this.btnPrev.getComponent(cc.Button).enabled = true;
        this.btnNext.getComponent(cc.Button).enabled = true;
    }
}
