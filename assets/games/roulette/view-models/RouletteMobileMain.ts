import AudioManager from "../../../common/audio/AudioManager";
import RouletteMain from "./RouletteMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteMobileMain extends RouletteMain {
    @property(cc.Node)
    quickBetButton: cc.Node = null;

    @property(cc.Node)
    regularBetButton: cc.Node = null;

    @property(cc.Node)
    smallRegularBetNode: cc.Node = null;

    @property(cc.Node)
    switchQuickBetTime: cc.Node = null;

    @property(cc.Node)
    switchViewBackground: cc.Node = null;

    // private quickBetDialog: any;
    private prevQuickBetPosition = cc.v2();
    private prevRegularBetPosition = cc.v2();
    private prevTimePosition = cc.v2();

    onLoad() {
        super.onLoad();
        this.quickBetButton.active = true;
        this.regularBetButton.active = false;
        this.quickBet.node.active = false;
        this.backgroundWheel.active = false;
        this.switchViewBackground.active = false;
        this.wheel.node.y = this.wheelHidePositionY;
        this.prevQuickBetPosition = this.quickBet.node.position;
        this.prevRegularBetPosition = this.board.node.position;
        this.prevTimePosition = this.timeWaitNode.parent.position;
    }

    playAnimationSwitchViewButton() {
        const action = cc.repeatForever(
            cc.sequence(cc.scaleTo(0.8, 1.05).easing(cc.easeSineInOut()), cc.scaleTo(0.8, 1.0).easing(cc.easeSineInOut()))
        );
        action.setTag(1);
        this.quickBetButton.parent.runAction(action);
    }

    stopAnimationSwitchViewButton() {
        this.quickBetButton.parent.scale = 1;
        this.quickBetButton.parent.stopActionByTag(1);
    }

    enableQuickBet(enable: boolean) {
        this.quickBetButton.getComponent(cc.Button).interactable = enable;
        const disableSprite = this.quickBetButton.parent.children[2];
        if (disableSprite) {
            disableSprite.active = !enable;
        }
        if (enable) {
            this.playAnimationSwitchViewButton();
        } else {
            this.stopAnimationSwitchViewButton();
        }
    }

    switchToQuickBet() {
        AudioManager.getInstance().playClick();
        this.quickBetButton.active = false;
        this.regularBetButton.active = true;
        this.switchViewBackground.active = true;
        this.quickBet.node.active = true;
        this.quickBet.node.y = this.smallRegularBetNode.y;
        this.quickBet.node.scale = 0;
        this.rearrangeIndexCallback(1);
        this.quickBet.node.stopAllActions();
        this.board.node.stopAllActions();
        this.timeWaitNode.stopAllActions();

        cc.tween(this.quickBet.node)
            .to(0.3, {
                scale: { value: 1, easing: "circInOut" },
                position: { value: this.prevQuickBetPosition, easing: "circInOut" }
            })
            .start();

        cc.tween(this.board.node)
            .to(0.3, {
                scale: { value: 0.452, easing: "circInOut" },
                position: { value: this.smallRegularBetNode.position, easing: "circInOut" }
            })
            .start();

        cc.tween(this.timeWaitNode.parent)
            .to(0.1, { opacity: 0, scale: 0 }, { easing: "circInOut" })
            .call(() => {
                this.timeWaitNode.parent.position = this.switchQuickBetTime.position;
            })
            .to(0.3, { opacity: 255, scale: 1 }, { easing: "circInOut" })
            .start();
    }

    switchToRegularBet() {
        this.board.clearHighlight();

        AudioManager.getInstance().playClick();
        this.quickBetButton.active = true;
        this.regularBetButton.active = false;
        this.switchViewBackground.active = false;
        this.rearrangeIndexCallback(0);
        this.quickBet.node.stopAllActions();
        this.board.node.stopAllActions();
        this.timeWaitNode.stopAllActions();

        cc.tween(this.quickBet.node)
            .to(0.3, {
                scale: { value: 0, easing: "circInOut" },
                position: { value: this.smallRegularBetNode.position, easing: "circInOut" }
            })
            .start();

        cc.tween(this.board.node)
            .to(0.3, {
                scale: { value: 1, easing: "circInOut" },
                position: { value: this.prevRegularBetPosition, easing: "circInOut" }
            })
            .start();

        cc.tween(this.timeWaitNode.parent)
            .to(0.1, { opacity: 0, scale: 0 }, { easing: "circInOut" })
            .call(() => {
                this.timeWaitNode.parent.position = this.prevTimePosition;
            })
            .to(0.3, { opacity: 255, scale: 1 }, { easing: "circInOut" })
            .start();
    }
}
