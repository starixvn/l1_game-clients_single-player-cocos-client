import * as sessionManager from "../../common/auth/SessionManager";
import { OperatorAlias } from "../../ISystem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SplashWidgetSprite extends cc.Component {
    @property
    top = 0;

    @property
    topTip88 = 0;

    onLoad() {
        console.log('[SplashWidgetSprite] Component loaded');
        this.setWidget();
    }

    setWidget() {
        const operator = sessionManager.getOperator()?.toUpperCase();
        console.log(`[SplashWidgetSprite] Setting widget for operator: ${operator}`);
        const widget = this.node.getComponent(cc.Widget);
        const topValue = operator === OperatorAlias.TIP88 ? this.topTip88 : this.top;
        console.log(`[SplashWidgetSprite] Setting top value to: ${topValue} (TIP88: ${this.topTip88}, Default: ${this.top})`);
        widget.top = topValue;
        widget.updateAlignment();
        console.log('[SplashWidgetSprite] Widget alignment updated');
    }
}
