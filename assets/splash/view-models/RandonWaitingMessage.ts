import GameUtils from "../../common/GameUtils";
import _ = require("lodash");

const { ccclass, property } = cc._decorator;

@ccclass
export default class RandonWaitingMessage extends cc.Component {
    @property(cc.Label)
    messageLabel: cc.Label = null;

    private readonly animationDuration = 1;
    private readonly displayMessageTime = 4;
    private readonly moveY = 35;
    currentIndex = 0;
    messageList = ["ui.first_visit_message", "ui.checking_downloading"];
    messageTween: cc.Tween;

    onLoad() {
        this.messageList = _.shuffle(this.messageList);
        this.showMessage(0);
    }

    showMessage(duration = 1) {
        this.currentIndex++;
        if (this.currentIndex > this.messageList.length - 1) {
            this.currentIndex = 0;
        }
        this.setMessage(GameUtils.getText(this.messageList[this.currentIndex]));
        const messageNode = this.messageLabel.node;
        messageNode.y = -this.moveY;
        messageNode.opacity = 0;
        this.messageTween = cc
            .tween(messageNode)
            .to(duration, { position: cc.v3(0, 0, 0), opacity: 255 }, { easing: "sineIn" })
            .delay(this.displayMessageTime)
            .call(() => {
                this.hideMessage();
            })
            .start();
    }

    hideMessage() {
        this.messageTween = cc
            .tween(this.messageLabel.node)
            .to(this.animationDuration, { position: cc.v3(0, this.moveY, 0), opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                this.showMessage();
            })
            .start();
    }

    reset() {
        this.messageTween.stop();
        this.messageLabel.node.opacity = 255;
        this.messageLabel.node.position = cc.v3(0, 0, 0);
    }

    setMessage(message: string) {
        this.messageLabel.string = message;
    }
}
