cc.Class({
    extends: cc.Component,

    properties: {
        atlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        firstBetTime: {
            default: null,
            type: cc.Sprite
        },
        secondBetTime: {
            default: null,
            type: cc.Sprite
        }
    },

    onLoad() {
        this.node.active = false;
    },

    setRedTime: function (time) {
        this.redTime = time;
    },
    setTime: function (time, forceRed = false) {
        this.node.active = true;

        var firstTimeChar = time.substr(0, 1);
        var secondTimeChar = time.substr(1, 1);

        if (!this.firstBetTime.spriteFrame.name.includes(firstTimeChar)) {
            this.handleBetTimeAnimation(this.firstBetTime.node);
        }
        this.handleBetTimeAnimation(this.secondBetTime.node);

        var suffix = forceRed || (this.redTime !== undefined && time <= this.redTime) ? "red" : "";
        var firstFrame = this.atlas.getSpriteFrame(firstTimeChar + suffix);
        this.firstBetTime.spriteFrame = firstFrame;
        var secondFrame = this.atlas.getSpriteFrame(secondTimeChar + suffix);
        this.secondBetTime.spriteFrame = secondFrame;
    },
    handleBetTimeAnimation(node) {
        cc.tween(node)
            .to(0, {
                position: cc.v2(node.position.x, 60),
                opacity: 0
            })
            .to(0.2, {
                position: cc.v2(node.position.x, 0),
                opacity: 255
            })
            .to(0.1, {
                position: cc.v2(node.position.x, -10)
            })
            .to(0.1, {
                position: cc.v2(node.position.x, 0),
                opacity: 255
            })
            .start();
    }
});
