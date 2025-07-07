import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import GameUtils from "../../../common/GameUtils";
import { userManager } from "../../../common/user/UserManager";

type Choices = any;

export class BetModel extends EventEmitterBase {
    static Events = {
        CHANGE_OWN_BET: "BetModel:CHANGE_OWN_BET",
        UPDATE_PREVIOUS_BET: "BetModel:UPDATE_PREVIOUS_BET",
        CHANGE_BET_PERCENTAGE: "BetModel:CHANGE_BET_PERCENTAGE",
        CHANGE_OWN_CHIP: "BetModel:CHANGE_OWN_CHIP",
        CHANGE_PLAYER_CHIP: "BetModel:CHANGE_PLAYER_CHIP",
        CHANGE_TOTAL_CHIPS: "BetModel:CHANGE_TOTAL_CHIPS",
        CHANGE_OWN_CHIPS: "BetModel:CHANGE_OWN_CHIPS",
        PLACE_BET_FAILED: "BetModel:PLACE_BET_FAILED",
        PLACE_BET_SUCCESS: "BetModel:PLACE_BET_SUCCESS",
        FLY_OWN_CHIP_FAKE: "BetModel:FLY_OWN_CHIP_FAKE",
        CHANGE_OWN_CHIPS_FAKE: "BetModel:CHANGE_OWN_CHIPS_FAKE"
    };

    ownBets: Choices;
    getChipValues = () => [];
    protected ownChip: any;
    protected playerChip: any;
    protected totalChips: any;
    protected ownChips: any;
    protected betPercentage: any;

    clearData() {
        this.ownBets = null;
        this.ownChip = null;
        this.playerChip = null;
        this.totalChips = null;
        this.betPercentage = null;
        this.ownChips = null;
    }

    changeOwnBets(choices: Choices) {
        this.ownBets = choices;
        this.emit(BetModel.Events.CHANGE_OWN_BET, this.ownBets);
        this.emit(BetModel.Events.UPDATE_PREVIOUS_BET, this.ownBets);
    }

    initOwnChipsByOwnBets(ownBets: any) {
        Object.keys(ownBets).forEach((choice) => {
            const bet = ownBets[choice];
            const chips = GameUtils.getChipQuantity(bet, this.getChipValues());
            this.updateOwnChips(choice, chips);
        });
        this.ownChips && this.emit(BetModel.Events.CHANGE_OWN_CHIPS, this.ownChips);
    }

    placeBetSuccess(endBet: number) {
        this.emit(BetModel.Events.PLACE_BET_SUCCESS, endBet);
    }

    placeBetFailed() {
        this.emit(BetModel.Events.PLACE_BET_FAILED);
    }

    changeOwnChip(ownChip: any) {
        this.ownChip = ownChip;
        const { betChoice, amount } = ownChip;
        this.updateOwnChips(betChoice, { [amount]: 1 });
        this.updateTotalChips(betChoice, userManager.rate, { [amount]: 1 });
        this.emit(BetModel.Events.CHANGE_OWN_CHIP, this.ownChip);
    }

    flyOwnChipFake(ownBet: any) {
        this.emit(BetModel.Events.FLY_OWN_CHIP_FAKE, ownBet);
    }

    changeBetPercentage(percentage: number) {
        this.betPercentage = percentage;
        this.emit(BetModel.Events.CHANGE_BET_PERCENTAGE, this.betPercentage);
    }

    updateUI() {
        this.ownBets && this.emit(BetModel.Events.CHANGE_OWN_BET, this.ownBets);
        this.betPercentage && this.emit(BetModel.Events.CHANGE_BET_PERCENTAGE, this.betPercentage);
        this.totalChips && this.emit(BetModel.Events.CHANGE_TOTAL_CHIPS, this.totalChips);

        this.ownChips && this.emit(BetModel.Events.CHANGE_OWN_CHIPS, this.ownChips);
        this.ownBets && this.changeOwnChipsFake(this.ownBets);
    }

    changePlayerChip(data: any) {
        const { betChoice, amount, rate } = data.playerChip;
        const convertValue = GameUtils.getValueByCurrency(amount, rate);
        const chips = GameUtils.getChipQuantity(convertValue, this.getChipValues());

        this.playerChip = { ...data.playerChip, chips };
        this.updateTotalChips(betChoice, rate, { [amount]: 1 });
        this.emit(BetModel.Events.CHANGE_PLAYER_CHIP, this.playerChip);
    }

    private updateTotalChips(betChoice, rate, chips: any) {
        this.totalChips = this.totalChips ?? {};
        this.totalChips[rate] = this.totalChips[rate] ?? {};
        this.totalChips[rate][betChoice] = this.totalChips[rate][betChoice] ?? {};
        const currentChips = this.totalChips[rate][betChoice];
        Object.keys(chips).forEach((chipValue) => {
            currentChips[chipValue] = currentChips[chipValue] ?? 0;
            currentChips[chipValue] += chips[chipValue];
        });
    }

    private updateOwnChips(betChoice, chips: any) {
        this.ownChips = this.ownChips ?? {};
        this.ownChips[betChoice] = this.ownChips[betChoice] ?? {};
        const currentChips = this.ownChips[betChoice];
        Object.keys(chips).forEach((chipValue) => {
            currentChips[chipValue] = currentChips[chipValue] ?? 0;
            currentChips[chipValue] += chips[chipValue];
        });
    }

    changeTotalChips(totalChips: any) {
        this.totalChips = totalChips;
        this.emit(BetModel.Events.CHANGE_TOTAL_CHIPS, this.totalChips);
    }

    changeOwnChipsFake(ownBets) {
        this.emit(BetModel.Events.CHANGE_OWN_CHIPS_FAKE, ownBets);
    }

    handleRebet(rebet: any) {
        Object.keys(rebet).forEach((choice) => {
            const chips = rebet[choice];
            Object.keys(chips).forEach((chipValue) => {
                const quantity = chips[chipValue];
                for (let i = 0; i < quantity; i++) {
                    this.changeOwnChip({
                        betChoice: choice,
                        amount: chipValue
                    });
                }
            });
        });
    }
}
