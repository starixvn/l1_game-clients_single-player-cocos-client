cc.Class({
    extends: cc.Component,

    properties: {
        DegreePerSecond: 360
    },

    onEnable() {
        cc.tween(this.node)
            .by(1, {
                angle: -this.DegreePerSecond
            })
            .repeatForever()
            .start();
    }
});
