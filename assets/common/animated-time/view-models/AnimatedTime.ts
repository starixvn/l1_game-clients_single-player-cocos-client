const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimatedTime extends cc.Component {
    @property(cc.Label)
    firstChar: cc.Label = null;

    @property(cc.Label)
    secondChar: cc.Label = null;

    @property
    animated = true;

    @property
    effectLastTime = false;

    protected timeToChangeColor = 5;
    protected changedColor: cc.Color = cc.Color.RED;
    protected normalColor: cc.Color = cc.Color.WHITE;
    public animatedYTop = 70;
    public animatedYBottom = -10;
    public animatedYFinalBottom = 0;

    setRedTime(time: number) {
        this.timeToChangeColor = time;
    }

    setChangedColor(color: cc.Color) {
        this.changedColor = color;
    }

    setAnimatedY(yTop: number, yBottom: number) {
        this.animatedYTop = yTop;
        this.animatedYBottom = yBottom;
    }

    resetTime() {}

    public setTime(time: string, forceChangeColor = false) {
        this.node.active = true;
        const firstTimeChar = time.toString().slice(0, 1);
        const secondTimeChar = time.toString().slice(1, 2);

        if (this.firstChar.string !== firstTimeChar) {
            this.handleBetTimeAnimation(this.firstChar.node);
        }

        if (this.secondChar.string !== secondTimeChar) {
            this.handleBetTimeAnimation(this.secondChar.node);
        }

        this.firstChar.string = firstTimeChar;
        this.secondChar.string = secondTimeChar;

        if (this.effectLastTime && parseInt(time) <= this.timeToChangeColor) {
            this.playEffectLastTime();
        }

        this.setColor(time, forceChangeColor);
    }

    public handleBetTimeAnimation(node: cc.Node) {
        if (this.animated) {
            node.opacity = 0;

            cc.tween(node)
                .to(0, {
                    position: cc.v2(node.position.x, this.animatedYTop)
                })
                .to(0.2, {
                    position: cc.v2(node.position.x, 0),
                    opacity: 255
                })
                .to(0.1, {
                    position: cc.v2(node.position.x, this.animatedYBottom)
                })
                .to(0.1, {
                    position: cc.v2(node.position.x, this.animatedYFinalBottom)
                })
                .start();
        }
    }

    protected setColor(time: string, forceChangeColor = false) {
        const colorChange = forceChangeColor || (this.timeToChangeColor !== undefined && parseInt(time) <= this.timeToChangeColor);
        this.firstChar.node.color = colorChange ? this.changedColor : this.normalColor;
        this.secondChar.node.color = this.firstChar.node.color;
    }

    setNumberColor(normalColor: string, changedColor: string) {
        this.normalColor = cc.Color.WHITE.fromHEX(normalColor);
        this.changedColor = cc.Color.WHITE.fromHEX(changedColor);
    }

    playEffectLastTime() {
        const groupTime = this.firstChar.node.parent;
        groupTime.scale = 0;
        groupTime.opacity = 0;
        cc.tween(groupTime).to(0.3, { scale: 1, opacity: 255 }, { easing: "quintInOut" }).start();
    }
}
