import { ChoiceBet, SoloBetModel } from "../../_solo_game/solo-bet-model";
import { convertOwnBetsToTempBet, getTypeFromChoice } from "./roulette-s-utils";

export class RouletteBetModel extends SoloBetModel {
    protected addTempBet(bet: ChoiceBet) {
        super.addTempBet(bet);

        const type = getTypeFromChoice(bet.choice);
        this.flyOwnChipFake({ endBet: this.currentBet, betChoice: type });
    }

    getTotalBetOnChoice(choice: string) {
        const convertedOwnBets = convertOwnBetsToTempBet(this.ownBets);
        return convertedOwnBets.amount ?? 0;
    }
}
