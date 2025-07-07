const { ccclass, property } = cc._decorator;

@ccclass
export default class Simulated3DCards extends cc.Component {
    @property(cc.Node)
    cardsDealer1: cc.Node = null;

    @property(cc.Node)
    cardsDealer2: cc.Node = null;

    @property(cc.Node)
    cardsPlayer1: cc.Node = null;

    @property(cc.Node)
    cardsPlayer2: cc.Node = null;

    @property
    selectedPosZ = 0;

    @property
    cardViewScaleY = 1;

    @property
    movingOffsetX = 0;

    async moveYAndRotationCard(rotationXDealer: number, rotationXPlayer: number, selectedPosY: number, easingName: string) {
        this.movePositionCard(this.cardsDealer1, rotationXDealer, selectedPosY, easingName);
        this.movePositionCard(this.cardsDealer2, rotationXDealer, selectedPosY, easingName);
        this.movePositionCard(this.cardsPlayer1, rotationXPlayer, selectedPosY, easingName);
        this.movePositionCard(this.cardsPlayer2, rotationXPlayer, selectedPosY, easingName);
    }

    movePositionCard(node: cc.Node, rotationX: number, selectedPosY: number, easingName) {
        return cc
            .tween(node)
            .parallel(
                cc.tween(node).by(0.1, { x: this.movingOffsetX }),
                cc.tween(node).to(
                    0.2,
                    {
                        rotationX: rotationX,
                        y: selectedPosY,
                        z: this.selectedPosZ,
                        scaleY: this.cardViewScaleY
                    },
                    { easing: easingName }
                )
            )
            .start();
    }
}
