const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Common/BettingArea/BettingAreaTheme")
export default class BettingAreaTheme extends cc.Component {
  @property(cc.Node)
  background: cc.Node = null;

  @property(cc.Node)
  border: cc.Node = null;

  @property()
  get active() {
    return this.node.active;
  }

  set active(active: boolean) {
    this.node.active = active;
  }
}
