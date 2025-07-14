import HiLoEventHandler from "./HiLoEventHandler";

export type HiLoStatusType = {
    status: {
        win: boolean;
        bet: number;
    };

    isCollect: number;
};

export class HiLoStatusHandler extends HiLoEventHandler<HiLoStatusType> {
    protected verifyEvent(data: HiLoStatusType) {
        return !!data.status || !!data.isCollect;
    }

    protected handle(data: HiLoStatusType) {
        if (data.status) {
            this.successfulCollect(data.status);
        }

        if (data.isCollect === -1) {
            this.gameData.statusModel.collectFailed();
        }
    }

    private successfulCollect(status: any) {
        const { win, bet } = status;

        if (win) {
            this.gameData.statusModel.hasWon(bet);
        } else {
            this.gameData.statusModel.hasLost();
        }
        this.gameData.stateModel.collect();
    }
}
