import * as i18n from "i18n/runtime-scripts/LanguageData";

import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../../analytics/AnalyticsManager";
import EffectAppearanceLabel from "../../../common/EffectAppearanceLabel";
import GameUtils from "../../../common/GameUtils";
import MD5Tip from "../../../common/md5-tooltip/MD5Tip";
import MD5Frame from "./MD5Frame";

const { ccclass, property } = cc._decorator;

export type MD5Type = {
    extraInfos: any;
    rawValue: string;
    hashValue: string;
};
@ccclass
export default class MD5Component extends cc.Component {
    @property(cc.Label)
    md5Text: cc.Label = null;

    @property(EffectAppearanceLabel)
    md5Value: EffectAppearanceLabel = null;

    @property(cc.Button)
    copyButton: cc.Button = null;

    @property(cc.Node)
    hintCopyNode: cc.Node = null;

    @property(cc.Node)
    md5ContentContainer: cc.Node = null;

    @property
    lengthOfMd5 = 21;

    @property(cc.Prefab)
    md5TooltipPrefab: cc.Prefab = null;

    @property(cc.Node)
    md5TooltipContainer: cc.Node = null;

    @property
    delayShowRawValue = 0;

    public timeout: any;
    private md5CopyString: string = null;
    readonly duration: number = 0.5;
    readonly delayShowHashValue: number = 1.35;
    protected md5Tip: MD5Tip = null;
    maximumStringAllowed = 32;
    public hintLabel: cc.Label = null;
    public gameId: number;
    protected tipString: string;

    onLoad() {
        this.initMD5Tooltip();
        this.registerTouchEvents();
    }

    onDestroy() {
        this.removeTouchEvents();
    }

    private registerTouchEvents() {
        this.md5ContentContainer.on(cc.Node.EventType.MOUSE_ENTER, this.showTooltip, this);
        this.md5ContentContainer.on(cc.Node.EventType.MOUSE_LEAVE, this.hideTooltip, this);
        this.md5ContentContainer.on(cc.Node.EventType.TOUCH_START, this.showTooltip, this);
    }

    private removeTouchEvents() {
        this.md5ContentContainer.off(cc.Node.EventType.MOUSE_ENTER, this.showTooltip, this);
        this.md5ContentContainer.off(cc.Node.EventType.MOUSE_LEAVE, this.hideTooltip, this);
        this.md5ContentContainer.off(cc.Node.EventType.TOUCH_START, this.showTooltip, this);
    }

    start() {
        this.trackingAction(TrackingAction.Show);
    }

    trackingAction(action: string) {
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: action,
            object_name: "MD5",
            game_name: GameUtils.getGameNameString(this.gameId)
        });
    }

    initMD5Wrapper(node: cc.Node) {
        const md5Frame = node.getComponent(MD5Frame);
        this.md5Text = md5Frame.md5Label;
        this.copyButton = md5Frame.md5CopyBtn;
        this.hintCopyNode = md5Frame.md5HintCopy;
        const md5ContentWidth = this.md5ContentContainer.width;
        this.hintLabel = this.hintCopyNode.getChildByName("content").getComponent(cc.Label);
        this.hintLabel.string = i18n.t("messages.copy_success");
        this.setCaptionAndHintForMD5(false);
        md5Frame.onClickCopyButton = () => {
            this.onClickCopyButton();
        };
        md5Frame.updateLayout(md5ContentWidth);
    }

    initMD5Tooltip() {
        const mini = GameUtils.createNodeFromPrefab(this.md5TooltipPrefab);
        this.md5Tip = mini.getComponent(MD5Tip);
        this.md5TooltipContainer.addChild(mini);
    }

    showTooltip() {
        if (this.tipString) {
            this.md5Tip.setData(this.tipString);
            this.md5Tip.show(true);
            cc.tween(this.md5Tip.node).to(0.2, { opacity: 255 }).delay(2).to(0.1, { opacity: 0 }).start();
        }
    }

    hideTooltip() {
        this.md5Tip.show(false);
    }

    updateMD5WithDelay(data: MD5Type) {
        if (!this.node.activeInHierarchy) {
            this.updateMD5Data(data);
            return;
        }

        const delayTime = !!data?.rawValue ? this.delayShowRawValue : this.delayShowHashValue;
        this.timeout = setTimeout(() => {
            this.updateMD5Data(data);
        }, delayTime * 1000);
    }

    updateMD5Data(data: MD5Type) {
        this.setDataTip(data);
        if (this.node && this.node.isValid) {
            this.setCaptionAndHintForMD5(!!data?.rawValue);
            this.generateMD5Result(data);
            const value = data?.hashValue || data?.rawValue;
            value && this.setCopyString(value);
        }
    }

    generateMD5Result(data: MD5Type) {
        const value = data?.hashValue || data?.rawValue;
        this.updateValue(value);
    }

    updateValue(value: string) {
        if (value) {
            const formatValue = value.length > this.maximumStringAllowed ? value.slice(0, this.lengthOfMd5) + "..." : value;
            this.md5Value.string = `${formatValue}`;
        }
    }

    resetMd5() {
        this.md5Value.string = "";
        this.tipString = "";
        this.setCopyString("");
        this.timeout && clearTimeout(this.timeout);
    }

    setCopyString(text: string) {
        this.md5CopyString = text;
    }

    setDataTip(data: MD5Type) {
        this.tipString = data.rawValue;
    }

    onClickCopyButton() {
        GameUtils.copyToClipboard(this.md5CopyString, this.hintLabel, () => this.showHint());
        this.md5Tip.show(false);
        this.trackingAction(TrackingAction.Click);
    }

    showHint() {
        cc.tween(this.hintCopyNode).to(0.2, { opacity: 255 }).delay(1).to(0.1, { opacity: 0 }).start();
    }

    setCaptionAndHintForMD5(isMD5Key: boolean) {
        this.md5Text.string = i18n.t(isMD5Key ? "ui.md5_result" : "ui.md5_string");
        this.md5Text.node.position = cc.v3(-5, 0, 0);
        cc.tween(this.md5Text.node)
            .to(0.3, { position: cc.v3(0, 0, 0) })
            .start();
    }

    setDelayShowRawValue(delay: number) {
        this.delayShowRawValue = delay;
    }
}
