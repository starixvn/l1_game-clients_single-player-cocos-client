import GameBaseBetHandler from "../../../_base/handlers/GameBaseBetHandler";
import SpecialSeDie from "../SpecialSeDie";

export default class SpecialSeDieBetHandler extends GameBaseBetHandler {
  constructor(protected readonly main: SpecialSeDie) {
    super(main);
  }

  handle(data: any): boolean {
    if (data.totalBets) {
      this.main.totalBets = data.totalBets;
    }

    if (data.betPercentage) {
      Object.keys(data.betPercentage).forEach((choice) => {
        this.main.showBetPercentage(choice, data.betPercentage[choice]);
      });
    }

    return super.handle(data);
  }
}
