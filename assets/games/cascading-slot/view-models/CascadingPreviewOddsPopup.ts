import CascadeSlotReelItem from "./CascadeSlotReelItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingPreviewOddsPopup extends cc.Component {
    onSymbolPreview = (symbol: CascadeSlotReelItem, worldPosition: cc.Vec3, isInfoOnLeft: boolean) => {};
    protected onSymbolTouched(symbol: CascadeSlotReelItem, worldPosition: cc.Vec3, isInfoOnLeft: boolean) {
        this.onSymbolPreview(symbol, worldPosition, isInfoOnLeft);
    }
}
