const { ccclass, property } = cc._decorator;
@ccclass
export default class SedieDish extends cc.Component {
    @property({ type: cc.Sprite })
    dots: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    dotRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    dotWhite: cc.SpriteFrame = null;

    @property(cc.Node)
    randomPosNode: cc.Node = null;

    @property(cc.Node)
    plate: cc.Node = null;

    @property(cc.Animation)
    shakeThePlateAnimation: cc.Animation = null;

    setDots(result: any, roundId: number) {
        const randomOption = this.randomPosNode.children[roundId % 5];

        Object.keys(result).forEach((key, index) => {
            this.dots[index].node.position = randomOption.children[index].position;
            this.dots[index].spriteFrame = result[key] ? this.dotRed : this.dotWhite;
        });
    }

    shake() {
        this.shakeThePlateAnimation.play();
    }

    openPlate(animated: boolean) {
        if (animated) {
            cc.tween(this.plate)
                .to(0.5, { position: cc.v2(50, 100) }, { easing: "sineInOut" })
                .to(0.2, { opacity: 0 })
                .start();
        } else {
            this.plate.position = cc.v3(50, 150, 0);
            this.plate.opacity = 0;
        }
    }

    closePlate() {
        cc.tween(this.plate)
            .to(0, { opacity: 255 })
            .to(0.5, { position: cc.v2(0, 0) })
            .start();
    }
}
