const { ccclass, property } = cc._decorator;

@ccclass
export default class DeviceVisibleNode extends cc.Component {
    @property()
    showOnDesktop = true;

    @property()
    showOnMobile = true;

    onLoad() {
        this.node.active = (cc.sys.isMobile && this.showOnMobile) || (!cc.sys.isMobile && this.showOnDesktop);
    }
}
