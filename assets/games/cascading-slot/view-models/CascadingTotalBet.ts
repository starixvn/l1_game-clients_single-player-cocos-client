import AudioManager from "../../../common/audio/AudioManager";
import StatusButton from "../../../common/custom-button/StatusButton";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import CascadingBetControl from "./CascadingBetControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingTotalBet extends cc.Component {
    @property(StatusButton)
    buttonIncrease: StatusButton = null;

    @property(StatusButton)
    buttonDecrease: StatusButton = null;

    @property(cc.Label)
    totalBetLabel: cc.Label = null;

    @property(cc.Node)
    disabled: cc.Node = null;

    @property(StatusButton)
    totalBetImg: StatusButton = null;

    protected betControl: CascadingBetControl;
    protected isOpenBetControl = false;
    protected increaseButtonStatus = true;
    protected decreaseButtonStatus = true;

    onLoad() {
        this.setAllowChangeBet(false);
    }

    initData(betControl: CascadingBetControl) {
        this.betControl = betControl;
        this.betControl.init(() => {
            this.onClickOpenBetControl();
        });
    }

    onClickOpenBetControl() {
        uiManager.emitter.emit(InternalEvents.CASCADING_CLOSE_MENU);
        uiManager.emitter.emit(InternalEvents.CASCADING_CLICK_TOTAL_BET);
        this.betControl.showView(!this.isOpenBetControl);
        this.isOpenBetControl = !this.isOpenBetControl;
    }

    onHandleStatusBetControl(event: Event, customEventData: string) {
        uiManager.emitter.emit(InternalEvents.CASCADING_CLICK_TOTAL_BET);
        AudioManager.getInstance().playClick();

        this.betControl.showView(!this.isOpenBetControl, customEventData);
        this.isOpenBetControl = !this.isOpenBetControl;
    }

    setAllowChangeBet(status: boolean) {
        this.buttonIncrease.interactable = status && this.increaseButtonStatus;
        this.buttonDecrease.interactable = status && this.decreaseButtonStatus;
        this.totalBetImg && (this.totalBetImg.interactable = status);
        this.disabled.active = !status;
    }

    setIncreaseButtonStatus(status: boolean) {
        AudioManager.getInstance().playClick();
        this.increaseButtonStatus = status;
        this.buttonIncrease.interactable = status;
    }

    setDecreaseButtonStatus(status: boolean) {
        AudioManager.getInstance().playClick();
        this.decreaseButtonStatus = status;
        this.buttonDecrease.interactable = status;
    }
}
