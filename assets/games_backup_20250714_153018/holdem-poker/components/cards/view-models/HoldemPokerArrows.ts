const { ccclass, property } = cc._decorator;
import HoldemPokerArrow from "./HoldemPokerArrow";
@ccclass
export default class HoldemPokerArrows extends cc.Component {
  @property(HoldemPokerArrow)
  arrowTop: HoldemPokerArrow = null;

  @property(HoldemPokerArrow)
  arrowBot: HoldemPokerArrow = null;

  showArrow(position: string, whose: string) {
    switch (position) {
      case "top":
        this.arrowTop.updateStateArrow(whose);
        this.arrowTop.node.active = true;
        this.arrowBot.node.active = true;

        break;
      case "bot":
        this.arrowBot.updateStateArrow(whose);
        this.arrowTop.node.active = true;
        this.arrowBot.node.active = true;
        break;
    }
  }
  hideAllArrow() {
    this.arrowTop.node.active = false;
    this.arrowBot.node.active = false;
    this.arrowTop.updateStateArrow("hideAll");
    this.arrowBot.updateStateArrow("hideAll");
  }
}
