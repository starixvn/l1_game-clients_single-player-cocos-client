const { ccclass, property } = cc._decorator;

@ccclass
export default class HoldemPokerArrow extends cc.Component {
  @property(cc.Node)
  arrowDealer: cc.Node = null;

  @property(cc.Node)
  arrowPlayer: cc.Node = null;

  onLoad() {
    this.arrowDealer.active = false;
    this.arrowPlayer.active = false;
  }

  updateStateArrow(who: string) {
    switch (who) {
      case "dealer":
        this.arrowDealer.active = true;
        this.arrowPlayer.active = false;
        break;
      case "player":
        this.arrowDealer.active = false;
        this.arrowPlayer.active = true;
        break;
      case "hideAll":
        this.arrowDealer.active = false;
        this.arrowPlayer.active = false;
        break;
    }
  }
}
