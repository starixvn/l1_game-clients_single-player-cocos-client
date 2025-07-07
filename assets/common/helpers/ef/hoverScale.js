cc.Class({
    extends: cc.Component,
    properties: {
        pressedScale: 1,
        transDuration: 0
    },
    onLoad() {
        this.initScale = this.node.scale;
    },
    onEnable: function () {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, this.eventOnHover, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.eventOffHover, this);
    },
    onDisable: function () {
        this.node.off(cc.Node.EventType.MOUSE_ENTER, this.eventOnHover, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.eventOffHover, this);
    },
    eventOnHover: function (e) {
        this.node.stopAllActions();
        cc.tween(this.node).to(this.transDuration, { scale: this.pressedScale }).start();
    },
    eventOffHover: function (e) {
        this.node.stopAllActions();
        cc.tween(this.node).to(this.transDuration, { scale: this.initScale }).start();
    }
});
