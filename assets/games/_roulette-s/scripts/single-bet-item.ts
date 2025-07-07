import AudioManager from "../../../common/audio/AudioManager";
import RouletteBetItem from "./roulette-bet-item";
import SingleBetControl from "./single-bet-control";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleBetItem extends RouletteBetItem {
    @property({ override: true })
    isGroupBet = true;

    @property(SingleBetControl)
    singleBetControl: SingleBetControl = null;

    public onBetClick(event: cc.Event.EventTouch) {
        AudioManager.getInstance().playClick();
        this.singleBetControl.showControl();
    }
}
