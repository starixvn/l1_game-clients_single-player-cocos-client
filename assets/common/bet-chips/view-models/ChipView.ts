import { nFormatter } from "../../helpers/NumberHelper";

const { ccclass, property } = cc._decorator;
export enum ChipDisplayType {
    Normal = 0,
    VIP
}

@ccclass
export default class ChipView extends cc.Component {
    @property(cc.Node)
    background: cc.Node = null;

    @property(cc.Sprite)
    center: cc.Sprite = null;

    @property(cc.Sprite)
    border: cc.Sprite = null;

    @property({ type: cc.SpriteFrame })
    centerFrames: cc.SpriteFrame[] = [];

    @property({ type: cc.SpriteFrame })
    borderFrames: cc.SpriteFrame[] = [];

    @property({ type: cc.Node })
    typeNodes: cc.Node[] = [];

    @property(cc.Label)
    label: cc.Label = null;

    color = cc.Color.WHITE;
    type = ChipDisplayType.Normal;

    setColor(color: cc.Color) {
        this.color = color;
        this.background.color = color;
        this.updateView();
    }

    setType(type: ChipDisplayType) {
        this.type = type;
        this.center.spriteFrame = this.centerFrames[type];
        if (!this.border) {
            this.border.spriteFrame = this.borderFrames[type];
        }

        this.typeNodes.forEach((node, index) => {
            node.active = index === type;
        });

        this.updateView();
    }

    setValue(value: number) {
        this.label.string = nFormatter(value, 0);
        this.node.name = value.toString();
    }

    updateView() {
        this.center.node.color = this.type === ChipDisplayType.VIP ? this.color : cc.Color.WHITE;
        this.label.node.color = this.type === ChipDisplayType.VIP ? cc.Color.YELLOW : cc.Color.WHITE;
    }

    applyForSmallChip(showValue = false) {
        this.label.node.active = showValue;

        this.typeNodes[0].children.forEach((node) => {
            const sprite = node.getComponent(cc.Sprite);
            if (sprite) {
                sprite.dstBlendFactor = cc.macro.BlendFactor.ONE_MINUS_SRC_ALPHA;
            }
        });

        const button = this.getComponent(cc.Button);
        if (button) {
            button.enabled = false;
        }
    }
}
