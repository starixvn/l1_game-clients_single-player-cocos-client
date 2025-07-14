import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import SymbolPreview, { SymbolPreviewType } from "../../_slotgame_base/SymbolPreview";
import CascadeSlotReelItem from "./CascadeSlotReelItem";
import { MULTIPLIER_SYMBOL, SCATTER_SYMBOL } from "./CascadingSlotUtils";

const { ccclass, property } = cc._decorator;

export interface CascadingSymbolPreviewType extends SymbolPreviewType {
    symbolItem: CascadeSlotReelItem;
}

@ccclass
export default class CascadingSymbolPreview extends SymbolPreview {
    @property(cc.Label)
    multiplierLabel: cc.Label = null;

    @property(cc.Node)
    content: cc.Node = null;

    onLoad() {
        super.onLoad();
        const cascadingEvents = [InternalEvents.CASCADING_CLICK_CHANGE_MODE, InternalEvents.CASCADING_CLICK_TOTAL_BET];
        cascadingEvents.forEach((event) => {
            uiManager.emitterListener(event, this.hidePreview.bind(this), this);
        });
    }

    renderInfo(info: CascadingSymbolPreviewType) {
        const { symbolItem } = info;
        if (symbolItem.index >= MULTIPLIER_SYMBOL) {
            this.showInfoNode(false);
            this.renderMultiplierSymbol(info);
        } else {
            this.showInfoNode(true);
            this.renderNormalSymbol(info);
        }
    }

    renderMultiplierSymbol(info: CascadingSymbolPreviewType) {
        const { colorList } = info;
        this.multiplierLabel.node.color = cc.Color.WHITE.fromHEX(colorList[1]);
    }

    showInfoNode(status: boolean) {
        this.infoNode.active = status;
        this.multiplierLabel.node.active = !status;
    }

    setInfo(info: CascadingSymbolPreviewType) {
        const nodeTmp = cc.instantiate(info.symbolItem.content.children[0]);
        this.content.addChild(nodeTmp);
        const skeleton = nodeTmp.getComponent(sp.Skeleton);
        skeleton.setAnimation(0, "highlight", false);
        this.border.color = cc.Color.WHITE.fromHEX(info.borderColor);
        this.renderInfo(info);
        this.checkShowSpecialSymbol(info);
    }

    renderNormalSymbol(info: CascadingSymbolPreviewType) {
        const { odds, colorList, coinValue, betLevel, symbolItem, freespin } = info;
        let firstLabelWidth = 0;

        this.infoNode.children.forEach((node, index) => {
            let values;
            let show;

            if (symbolItem.index === SCATTER_SYMBOL) {
                show = index < freespin.length && freespin[index].odds > 0;
                const count = freespin[index].count >= 6 ? `≥${freespin[index].count}` : `${freespin[index].count}`;
                values = [count, `${freespin[index].odds}`];
            } else {
                show = index < odds.length && odds[index].odds > 0;
                values = [`${odds[index].from}-${odds[index].to}`, `${numberWithCommas(odds[index].odds * coinValue * betLevel, 3)}`];
            }

            if (!show) {
                return;
            }

            node.children.forEach((child, childIndex) => {
                const label = child.getComponent(cc.Label);
                label.string = values[childIndex];
                child.color = cc.Color.WHITE.fromHEX(colorList[childIndex]);
                label._forceUpdateRenderData();
            });

            firstLabelWidth = this.findGreaterWidth(node, firstLabelWidth);
        });
        this.updateLabelWidth(firstLabelWidth);
    }

    findGreaterWidth(node, firstLabelWidth) {
        const firstLabel = node.children[0].getComponent(cc.Label);
        const labelWidth = firstLabel.node.width;
        labelWidth > firstLabelWidth && (firstLabelWidth = labelWidth);
        return firstLabelWidth;
    }

    updateLabelWidth(newWidth: number) {
        this.infoNode.children.forEach((node) => {
            const firstLabel = node.children[0].getComponent(cc.Label);
            firstLabel.overflow = cc.Label.Overflow.CLAMP;
            firstLabel.node.width = newWidth;
            firstLabel.enableWrapText = false;
        });
    }

    checkShowSpecialSymbol(info) {
        const index = info.symbolItem.index;
        if (index === 9) {
            this.textImages.active = true;
            this.textImages.children.forEach((node) => {
                const lbl = node.getComponent(cc.Label);
                lbl.node.color = cc.Color.WHITE.fromHEX(info.colorList[1]);
            });
        }
    }
}
