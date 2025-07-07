import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export default class CascadingUIModel extends EventEmitterBase {
    static Events = {
        CHANGE_TUMBLE_WIN: "ui:change_tumble_win",
        CHANGE_TOTAL_WIN: "ui:change_total_win",
        CHANGE_MULTIPLIER: "ui:change_multiplier",
        CHANGE_TOTAL_MULTIPLIER: "ui:change_total_multiplier",

        SHOW_FREESPINS: "ui:show_freespins",
        SET_FREESPINS: "ui:set_freespins",
        SET_STAKE_FREESPINS: "ui:set_stake_freespins",
        INCREASE_FREESPINS: "ui:increase_frespins",

        CHANGE_TOTAL_BET: "ui:change_total_bet",

        RESET_NEW_ROUND: "ui:reset_new_round",

        GET_MULTIPLIER: "ui:get_multiplier",
        GET_TUMBLE: "ui:get_tumble"
    };

    totalTumbleWin = 0;
    totalWin = 0;
    multiplier = 0;

    totalMultiplier = 0;

    freeSpins = 0;

    resetNewRound() {
        this.totalTumbleWin = 0;
        this.totalWin = 0;
        this.multiplier = 0;

        this.emit(CascadingUIModel.Events.RESET_NEW_ROUND);
    }

    increaseTumbleWin(value: number) {
        this.totalTumbleWin += value;
        this.emit(CascadingUIModel.Events.CHANGE_TUMBLE_WIN, this.totalTumbleWin);
    }

    setTotalWin(value: number) {
        this.totalWin = value;
        this.emit(CascadingUIModel.Events.CHANGE_TOTAL_WIN, this.totalWin);
    }

    getMultiplier() {
        this.emit(CascadingUIModel.Events.GET_MULTIPLIER);
    }

    getTumble() {
        this.emit(CascadingUIModel.Events.GET_TUMBLE);
    }

    increaseMultiplier(value: number) {
        this.multiplier += value;
        this.emit(CascadingUIModel.Events.CHANGE_MULTIPLIER, this.multiplier);
    }

    changeTotalMultiplier(data: { value: number; show: boolean }) {
        this.totalMultiplier = data.value;
        this.emit(CascadingUIModel.Events.CHANGE_TOTAL_MULTIPLIER, data);
    }

    setFreeSpins(value: number) {
        this.freeSpins = value;
        this.emit(CascadingUIModel.Events.SET_FREESPINS, this.freeSpins);
    }

    showFreeSpins(show: boolean) {
        this.emit(CascadingUIModel.Events.SHOW_FREESPINS, show);
    }

    setStakeFreeSpin(coin: number, level: number) {
        this.emit(CascadingUIModel.Events.SET_STAKE_FREESPINS, { coin, level });
    }

    increaseFrespins(value: number) {
        this.freeSpins += value;
        this.emit(CascadingUIModel.Events.INCREASE_FREESPINS, this.freeSpins);
    }
}
