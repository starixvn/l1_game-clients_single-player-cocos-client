import { BaseEventHandler } from "./base-handler";

type Choices = any;
export type TotalBetsEventType = {
    totalBets: Choices;
};

export class TotalBetsEventHandler extends BaseEventHandler<TotalBetsEventType> {
    protected verifyEvent(event: TotalBetsEventType) {
        return !!event.totalBets;
    }

    protected handle(event: TotalBetsEventType) {
        this.gameData.totalBets.update(event.totalBets);
    }
}
