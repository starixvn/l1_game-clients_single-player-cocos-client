import { Durations, DurationsOptions } from "../../_new/_base/game-data-management/models/durations";

export class NewDurations extends Durations {
    eventInfo: any;
    events = [];

    initialize({ wholeRound, placingBet, lockingBet, waitingTime }: DurationsOptions) {
        super.initialize({ wholeRound, placingBet, lockingBet, waitingTime });
        this.initBaseEventInfo();
    }

    protected calculateAndEmitEvent() {
        if (this.remaining < 0) {
            return;
        }

        this.emit(Durations.Events.CHANGE_REMAINING_TIME, { remaining: this.remaining });
        const criteria = this.events.map((event) => {
            const { startTimePoint, endTimePoint } = this.eventInfo[event];
            return {
                name: event,
                condition: () => this.isBeingSpecificPhase(event),
                remaining: () => this.remaining - endTimePoint,
                duration: () => startTimePoint - this.remaining
            };
        });

        criteria.forEach(({ name, condition, remaining, duration }) => {
            if (condition()) {
                this.emit(name, {
                    remaining: remaining(),
                    globalRemaining: this.remaining,
                    duration: duration()
                });
            }
        });
    }

    initBaseEventInfo() {
        this.eventInfo = {
            [Durations.Events.WAITING]: {
                startTimePoint: this.wholeRound,
                endTimePoint: this.placingBet
            },
            [Durations.Events.PLACING_BET]: {
                startTimePoint: this.placingBet,
                endTimePoint: this.lockingBet
            },
            [Durations.Events.LOCKING_BET]: {
                startTimePoint: this.lockingBet,
                endTimePoint: 0
            }
        };
        this.events = [Durations.Events.WAITING, Durations.Events.PLACING_BET, Durations.Events.LOCKING_BET];
    }

    isBeingSpecificPhase(event: string): boolean {
        if (!this.eventInfo[event]) {
            return false;
        }
        const { startTimePoint, endTimePoint } = this.eventInfo[event];
        return this.remaining <= startTimePoint && this.remaining > endTimePoint;
    }

    addEvent(event: string, info: { startTimePoint: number; endTimePoint: number }, prevEvent?: string, nextEvent?: string) {
        this.events.push(event);
        this.eventInfo[event] = info;

        if (prevEvent) {
            this.eventInfo[prevEvent].endTimePoint = info.startTimePoint;
        }
        if (nextEvent) {
            this.eventInfo[nextEvent].startTimePoint = info.endTimePoint;
        }
    }

    isWaiting() {
        return this.isBeingSpecificPhase(Durations.Events.WAITING);
    }

    isLocking() {
        return this.isBeingSpecificPhase(Durations.Events.LOCKING_BET);
    }

    isPlacingBet() {
        return this.isBeingSpecificPhase(Durations.Events.PLACING_BET);
    }
}
