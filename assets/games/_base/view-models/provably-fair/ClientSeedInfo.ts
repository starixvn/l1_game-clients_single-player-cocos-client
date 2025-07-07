const { ccclass, property } = cc._decorator;

@ccclass
export class ClientSeedInfo extends cc.Component {
    @property(cc.Label)
    lblName: cc.Label = null;

    @property(cc.Label)
    lblClientSeed: cc.Label = null;

    @property(cc.Node)
    nodeDisabledBg: cc.Node = null;

    resetClientSeedData() {
        this.lblName.node.active = false;
        this.lblClientSeed.string = this.lblName.string = "";
    }

    setDisplay(data: any) {
        this.lblName.node.active = true;
        this.lblName.string = this.encryptedName(data.name);
        this.lblClientSeed.string = data.clientSeed;
    }

    activeDisabledBg(show: boolean) {
        this.nodeDisabledBg.active = show;
    }

    private encryptedName(name: string): string {
        return `(${name.substring(0, 1)}***${name.substring(name.length - 3, name.length)})`;
    }
}
