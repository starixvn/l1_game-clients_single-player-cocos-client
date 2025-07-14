import { ThreeCardsResultData } from "./DataDefinition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsResultItem extends cc.Component {
    @property({ type: cc.Sprite })
    icons: cc.Sprite[] = [];

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property
    prefix = "result_icon_";

    @property
    highlightPrefix = "result_highlight_";

    @property(cc.Animation)
    animation: cc.Animation = null;

    private readonly suffix = ["heart", "diamond", "club", "spade"];
    private data: ThreeCardsResultData;

    setData(data: ThreeCardsResultData) {
        this.data = data;
        this.setIcons(false);
    }

    setIcons(highlight: boolean) {
        const prefix = highlight ? this.highlightPrefix : this.prefix;
        const iconsCount = this.icons.length;
        this.data.forEach((icon, index) => {
            if (index >= iconsCount) {
                return;
            }

            this.icons[index].node.scale = 1;
            this.icons[index].spriteFrame = this.atlas.getSpriteFrame(`${prefix}${this.suffix[icon]}`);
        });
    }

    setHighlight(highlight: boolean) {
        if (highlight) {
            this.animation.play();
            this.setIcons(true);
        } else {
            this.animation.stop();
            this.setIcons(false);
        }
    }
}
