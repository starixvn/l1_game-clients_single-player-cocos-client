import AudioManager from "../../common/audio/AudioManager";
import LineItem from "./LineItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LineSelectionDialog extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    itemSample: cc.Node = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(cc.Button)
    confirmButton: cc.Button = null;

    @property({ type: cc.Node })
    bgActive: cc.Node[] = [];

    private readonly items: LineItem[] = [];

    private timer = 0;

    isAccelerate = false;

    onConfirmCallback = (betChoices: number[]) => {};

    onLoad() {
        this.initPaylines();

        const commonDialog = this.mainFrame.getComponent("CommonDialog");
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }

    initPaylines() {
        for (let i = 0; i < 24; i++) {
            this.content.addChild(cc.instantiate(this.itemSample));
        }
        this.content.children.forEach((child, index) => {
            const item = child.getComponent(LineItem);
            const num = index + 1;
            item.icon.spriteFrame = this.loadPaylineSprite(num);
            item.num.string = `${num}`;
            item.setChecked(false);
            this.items.push(item);
        });
    }

    loadPaylineSprite(num): cc.SpriteFrame {
        return this.atlas.getSpriteFrame(`dong${num}`);
    }

    setCheckItems(items: number[]) {
        items.forEach((item) => {
            this.items[item].setChecked(true);
        });
    }

    onCloseDialog() {
        AudioManager.getInstance().playClick();

        this.node.destroy();
    }

    selectAllEvenLine() {
        AudioManager.getInstance().playClick();
        this.showActiveBg(0);

        this.items.forEach((item, index) => {
            item.setChecked(index % 2 !== 0);
        });
    }

    showActiveBg(index) {
        if (this.bgActive.length > 0) {
            this.bgActive.forEach((item, i) => {
                item.active = index === i;
            });
        }
    }

    selectAllOddLine() {
        AudioManager.getInstance().playClick();
        this.showActiveBg(1);

        this.items.forEach((item, index) => {
            item.setChecked(index % 2 === 0);
        });
    }

    selectAll() {
        AudioManager.getInstance().playClick();
        this.showActiveBg(2);

        this.items.forEach((item) => {
            item.setChecked(true);
        });
    }

    unSelectAll() {
        AudioManager.getInstance().playClick();
        this.showActiveBg(3);

        this.items.forEach((item) => {
            item.setChecked(false);
        });
    }

    onConfirmClick() {
        AudioManager.getInstance().playClick();
        this.onConfirmCallback(this.getCurrentBetChoices());
        this.node.destroy();
    }

    getCurrentBetChoices(): number[] {
        const betChoices: number[] = [];
        this.items.forEach((item, index) => item.toggle.isChecked && betChoices.push(index));
        return betChoices;
    }

    update(dt: number) {
        if (!this.isAccelerate) {
            this.timer++;
            if (this.timer > 20) {
                this.timer = 0;
                const betChoices = this.getCurrentBetChoices();
                this.confirmButton.interactable = betChoices.length > 0;
            }
        }
    }
}
