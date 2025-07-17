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
        console.log('[RandonWaitingMessage] Component loaded');
        // this.messageList = _.shuffle(this.messageList);
        console.log(`[RandonWaitingMessage] Shuffled message list: ${this.messageList.join(', ')}`);
        // this.showMessage(0);
    }

    showMessage(duration = 1) {
        this.currentIndex++;
        if (this.currentIndex > this.messageList.length - 1) {
            this.currentIndex = 0;
        }
        const messageKey = this.messageList[this.currentIndex];
        const messageText = GameUtils.getText(messageKey);
        console.log(`[RandonWaitingMessage] Showing message ${this.currentIndex + 1}/${this.messageList.length}: "${messageKey}" -> "${messageText}"`);
        this.setMessage(messageText);
        const messageNode = this.messageLabel.node;
        messageNode.y = -this.moveY;
        messageNode.opacity = 0;
        console.log(`[RandonWaitingMessage] Starting show animation with duration: ${duration}s`);
        this.messageTween = cc
            .tween(messageNode)
            .to(duration, { position: cc.v3(0, 0, 0), opacity: 255 }, { easing: "sineIn" })
            .delay(this.displayMessageTime)
            .call(() => {
                console.log('[RandonWaitingMessage] Show animation completed, hiding message');
                this.hideMessage();
            })
            .start();
    }

    hideMessage() {
        console.log('[RandonWaitingMessage] Starting hide animation');
        this.messageTween = cc
            .tween(this.messageLabel.node)
            .to(this.animationDuration, { position: cc.v3(0, this.moveY, 0), opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                console.log('[RandonWaitingMessage] Hide animation completed, showing next message');
                this.showMessage();
            })
            .start();
    }

    reset() {
        console.log('[RandonWaitingMessage] Resetting message component');
        this.messageTween.stop();
        this.messageLabel.node.opacity = 255;
        this.messageLabel.node.position = cc.v3(0, 0, 0);
        console.log('[RandonWaitingMessage] Reset completed');
    }

    setMessage(message: string) {
        console.log(`[RandonWaitingMessage] Setting message text: "${message}"`);
        this.messageLabel.string = message;
    }
}
