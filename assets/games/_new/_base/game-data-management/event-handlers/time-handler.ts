import { BaseEventHandler } from "./base-handler";

export type TimeEventType = {
    remainingTime: number;
};

export class TimeEventHandler extends BaseEventHandler<TimeEventType> {
    verifyEvent(event: TimeEventType) {
        return event.remainingTime != null;
    }

    handle(event: TimeEventType) {
        const { remainingTime } = event;

        this.gameData.durations.remaining = remainingTime;
        !this.gameData.isUnderMaintenance && this.gameData.durations.start();
    }
}
