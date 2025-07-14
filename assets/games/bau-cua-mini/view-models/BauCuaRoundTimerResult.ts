import CustomeRoundTimerResult from "../../../mini-games-panel/view-models/CustomeRoundTimerResult";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCuaRoundTimerResult extends CustomeRoundTimerResult {
    private resultContainer: cc.Node;

    onLoad() {
        this.resultContainer = this.node.children[0];
    }

    override show(data) {
        this.showMultiWinningChoice(data.result);
        this.playAnimation(this.node);
    }

    showMultiWinningChoice(result) {
        if (!this.resultContainer) {
            return;
        }
        this.resultContainer.destroyAllChildren();
        Object.values(result).forEach((choice) => {
            const sprite = new cc.Node().addComponent(cc.Sprite);
            this.resultContainer.addChild(sprite.node);

            cc.resources.load<cc.SpriteFrame>(`minipanel/popup-mini-game/textures/3/${choice}`, cc.SpriteFrame, (err, frame) => {
                if (frame) {
                    sprite.spriteFrame = frame;
                }
            });
        });

        const layout = this.resultContainer.getComponent(cc.Layout);
        layout.updateLayout();
    }
}
