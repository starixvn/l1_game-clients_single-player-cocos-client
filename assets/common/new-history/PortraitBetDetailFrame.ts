import BetDetailFrame from "./BetDetailFrame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PortraitBetDetailFrame extends BetDetailFrame {
    protected override PADDING_AROUND_POPUP = 40;
}
