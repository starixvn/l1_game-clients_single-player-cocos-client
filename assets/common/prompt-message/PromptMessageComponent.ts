import { i18n } from "../../ClientModules";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromptMessageComponent extends cc.Component {
    @property({ type: cc.Label })
    resultText: cc.Label = null;

    protected durationShow = 1.5;
    protected durationAnimOpacity = 0.3;
    protected durationAnimMove = 0.4;
    protected easingStart = "sineOut";

    start() {
        this.node.opacity = 0;
    }

    set content(value: string) {
        this.show(value);
    }

    protected show(text: string) {
        this.resultText.string = text;
        this.prompt();
    }

    prompt() {
        const opacity = this.node;
        opacity.opacity = 1;
        const clonePositionX = this.node.position.x;

        cc.tween(opacity)
            .to(this.durationAnimOpacity, { opacity: 255 }, { easing: this.easingStart })
            .delay(this.durationShow - this.durationAnimOpacity * 2)
            .to(this.durationAnimOpacity, { opacity: 0 }, { easing: this.easingStart })
            .start();

        cc.tween(this.node)
            .to(
                this.durationAnimMove,
                {
                    position: cc.v3(0, 0, 0)
                },
                { easing: this.easingStart }
            )
            .delay(this.durationShow - this.durationAnimMove * 2)
            .to(
                this.durationAnimMove,
                {
                    position: cc.v3(Math.abs(clonePositionX), 0, 0)
                },
                { easing: this.easingStart }
            )
            .delay(0.2)
            .to(0.1, {
                position: cc.v3(clonePositionX, 0, 0)
            })
            .start();
    }

    showStartBetMessage() {
        const message = i18n.t("Common.message_place_bets").toUpperCase();
        this.content = message;
    }

    showStopBetMessage() {
        const message = i18n.t("Common.message_stop_bet").toUpperCase();
        this.content = message;
    }
}
