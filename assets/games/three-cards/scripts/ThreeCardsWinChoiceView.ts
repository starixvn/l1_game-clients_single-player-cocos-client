import GameUtils from "../../../common/GameUtils";
import { ThreeCardsBetData } from "./DataDefinition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsWinChoiceView extends cc.Component {
    @property(cc.Label)
    main: cc.Label = null;

    @property({ type: cc.Sprite })
    icons: cc.Sprite[] = [];

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property
    prefix = "result_icon_";

    onLoad() {}

    setData(data: ThreeCardsBetData) {
        const keys = ["diamonds", "hearts", "spades", "clubs"];
        const suffix = ["diamond", "heart", "spade", "club"];
        const { settlementResult } = data;
        const mainKey = settlementResult.red ? "red" : "black";
        this.main.string = GameUtils.getBetChoiceString(mainKey);

        let index = 0;
        this.icons.forEach((icon) => (icon.node.active = false));
        keys.forEach((key, i) => {
            if (settlementResult[key]) {
                this.icons[index].spriteFrame = this.atlas && this.atlas.getSpriteFrame(`${this.prefix}${suffix[i]}`);
                this.icons[index].node.active = true;
                index++;
            }
        });
    }
}
