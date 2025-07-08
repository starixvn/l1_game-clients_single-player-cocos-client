import { ChoiceBet, SoloBetModel } from "../../_solo_game/solo-bet-model";
import { getTypeFromChoice } from "./roulette-s-utils";

export class RouletteBetModel extends SoloBetModel {
    protected addTempBet(bet: ChoiceBet) {
        super.addTempBet(bet);

        const type = getTypeFromChoice(bet.choice);
        this.flyOwnChipFake({ endBet: this.currentBet, betChoice: type });
    }

    updateOwnbets() {
        const ownBets = {};
        this.queueBet.forEach((bet) => {
            const currentBet = ownBets[bet.choice] ?? 0;
            ownBets[bet.choice] = currentBet + bet.amount;
        });

        const groupBets = {};
        Object.keys(ownBets).forEach((choice) => {
            const type = getTypeFromChoice(choice);
            const currentBet = groupBets[type] ?? 0;
            groupBets[type] = currentBet + ownBets[choice];
        });
        Object.assign(ownBets, groupBets);
        console.log("ownBets", ownBets);
        this.changeOwnBets(ownBets);
    }
}
