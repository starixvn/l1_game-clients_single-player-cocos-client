import { OldCardModel } from "../../common/new-card/view-models/NewCard";
import MD5Component from "../_base/view-models/MD5Component";
import { FormatMD5Result } from "./MD5Format";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CasinoMD5 extends MD5Component {
    readonly maximumStringAllowed = 352;

    initMD5Wrapper(node: cc.Node) {
        super.initMD5Wrapper(node);
        this.enableCopyButton(false);
    }

    enableCopyButton(enabled: boolean) {
        this.copyButton.interactable = enabled;
        const color = cc.Color.WHITE;
        this.copyButton.node.getChildByName("text").color = enabled ? color : color.fromHEX("#a8a8a8");
    }

    setMD5String(data: string) {
        this.tipString = "";
        this.setCaptionAndHintForMD5(false);
        this.md5Value.string = data === "" ? "" : `<color=#ffffff>${data}</color>`;
        this.setCopyString(data);
    }

    initMD5Tooltip() {
        if (!this.md5TooltipPrefab || !this.md5TooltipContainer) {
            return;
        }
        super.initMD5Tooltip();
    }

    setCopyString(text: string) {
        super.setCopyString(text);
        this.enableCopyButton(text.length > 0);
    }

    createResultDetails(data: any) {
        this.tipString = data.rawValue;
        const { cards, suffix, roundId } = data.formatValue;
        this.setCaptionAndHintForMD5(true);
        this.setCopyString(data.rawValue);
        this.setMD5Value(cards, suffix, roundId);
    }

    setMD5Value(cards: OldCardModel[], suffix: string, roundId: string) {
        this.md5Value.string = FormatMD5Result({
            cards,
            suffix,
            firstCharacter: "{",
            endCharacter: "}",
            suitBlack: "#ffffff",
            suitRed: "#ffffff",
            isShowIconSuit: true,
            length: this.maximumStringAllowed,
            roundId
        });
    }
}
