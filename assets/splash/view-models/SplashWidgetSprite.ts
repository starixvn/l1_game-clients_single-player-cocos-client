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
        this.setWidget();
    }

    setWidget() {
        const operator = sessionManager.getOperator()?.toUpperCase();
        const widget = this.node.getComponent(cc.Widget);
        widget.top = operator === OperatorAlias.TIP88 ? this.topTip88 : this.top;
        widget.updateAlignment();
    }
}
