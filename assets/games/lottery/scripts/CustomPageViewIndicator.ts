const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomPageViewIndicator extends cc.PageViewIndicator {
    _changedState() {
        const indicators = this._indicators;
        if (indicators.length === 0) {
            return;
        }
        const idx = this._pageView._curPageIdx;
        if (idx >= indicators.length) {
            return;
        }
        indicators.forEach((node) => (node.opacity = 0));
        indicators[idx].opacity = 255;
    }
}
