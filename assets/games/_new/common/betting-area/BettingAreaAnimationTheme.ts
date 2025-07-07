import BettingAreaTheme from "./BettingAreaTheme";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Common/BettingArea/BettingAreaAnimationTheme")
export default class BettingAreaAnimationTheme extends BettingAreaTheme {
  @property(cc.Animation)
  protected animation: cc.Animation = null;

  @property({ override: true })
  get active() {
    return this.node.active;
  }

  set active(active: boolean) {
    this.node.active = active;
  }

  onEnable() {
    if (this.animation) {
      this.animation.play();
    }
  }

  onDisable() {
    if (this.animation) {
      this.animation.stop();
    }
  }
}
