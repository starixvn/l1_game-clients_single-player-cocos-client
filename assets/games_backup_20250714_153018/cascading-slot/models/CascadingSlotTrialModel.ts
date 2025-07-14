import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class CascadingSlotTrialModel extends EventEmitterBase {
    static Events = {
        CHANGE_USER_BALANCE: "trial:change_user_balance",
        UPDATE_SETTLED_BALANCE: "trial: update_settled_balance"
    };

    settleBalance: number;

    setUserBalance(balance: number) {
        this.emit(CascadingSlotTrialModel.Events.CHANGE_USER_BALANCE, balance);
    }

    cacheSettledBalance(balance: number) {
        this.settleBalance = balance;
    }

    updateSettledBalance() {
        this.emit(CascadingSlotTrialModel.Events.CHANGE_USER_BALANCE, this.settleBalance);
    }
}
