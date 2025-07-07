import EventEmitterBase from "../../../../../common/emitter/EventEmitterBase";

export type DurationsOptions = {
    wholeRound?: number;
    placingBet?: number;
    lockingBet?: number;
    waitingTime?: number;
};

/**
 * Timeline:
 *   |  Waiting  |  PlacingBet  |  LockingBet  | <-- Settle
 *   |-----------|--------------|--------------|
 *                    WholeRound
 */
export class Durations extends EventEmitterBase {
    static Events = {
        LOCKING_BET: "lockingBet",
        PLACING_BET: "placingBet",
        WAITING: "waiting",
        CHANGE_REMAINING_TIME: "changeRemainingTime",
        SHOW_ANIMATION: "showAnimation",
        END_EXTRA_ANIMATION: "showEndExtraAnimation",
        BEGIN_SHOW_ANIMATION: "beginShowAnimation",
        BEGIN_LOCKING_BET: "beginLockingBet",
        BEGIN_WAITING: "beginWaiting",
        BEGIN_PLACING_BET: "beginPlacingBet",
        TIMEOUT: "TIMEOUT",

        STARTING_ROUND: "startingRound",
        BEGIN_STARTING_ROUND: "beginStartingRound",

        START_GAME_LOOP: "startGameLoop",
        STOP_GAME_LOOP: "stopGameLoop"
    };

    private _remaining: number;
    private overrideEvent: { name: string; remaining: number; duration: number };
    private latestEventName: string;
    private latestEventCounter = 0;

    public wholeRound: number;
    public placingBet: number; // Include locking bet time
    protected waiting: number; // Mean: wholeRound - betTime
    protected lockingBet: number;

    constructor(options: DurationsOptions = {}) {
        super();
        this.initialize(options);
        this.remaining = -1;
        this.calculateAndEmitStartupEvents();
    }

    initialize({ wholeRound, placingBet, lockingBet, waitingTime }: DurationsOptions) {
        this.wholeRound = wholeRound || 0;
        this.placingBet = placingBet || 0;
        this.lockingBet = lockingBet || 0;
        this.waiting = waitingTime || this.wholeRound - this.placingBet;
    }

    /**
     * Not recommend using this function
     */
    reset() {
        this._remaining = 0;
    }

    start() {
        this.emit(Durations.Events.START_GAME_LOOP);
    }

    stop() {
        this.emit(Durations.Events.STOP_GAME_LOOP);
    }

    set remaining(value: number) {
        this._remaining = value;
        if (value === 0) {
            this.emit(Durations.Events.TIMEOUT);
        }
        this.calculateAndEmitEvent();
    }

    get remaining() {
        return this._remaining;
    }

    get timesOfTheSameEvent() {
        return this.latestEventCounter;
    }

    updateUI() {
        this.calculateAndEmitEvent();
    }

    countdown() {
        if (this.remaining > 1) {
            this.remaining = this.remaining - 1;
        } else {
            if (this.remaining > 0) {
                this.remaining = 0;
            }
        }
    }

    isWaiting() {
        return this.remaining > this.placingBet && this.wholeRound !== 0;
    }

    isLocking() {
        return this.remaining <= this.lockingBet && this.wholeRound !== 0;
    }

    isPlacingBet() {
        return this.remaining <= this.placingBet && this.remaining > this.lockingBet && this.wholeRound !== 0;
    }

    isBeforePlacingBet() {
        return this.remaining > this.placingBet;
    }

    forceEvent(eventName: string, duration: number) {
        this.overrideEvent = {
            name: eventName,
            remaining: duration,
            duration: 0
        };
    }

    protected calculateAndEmitEvent() {
        if (this.remaining < 0) {
            return;
        }

        this.emit(Durations.Events.CHANGE_REMAINING_TIME, { remaining: this.remaining });

        const criteria = [];
        const isOverridingEvent = this.overrideEvent && this.overrideEvent.remaining > 0;

        if (isOverridingEvent) {
            const data = {
                condition: true,
                ...this.overrideEvent
            };

            criteria.push(data);

            this.overrideEvent.remaining--;
            this.overrideEvent.duration++;
        } else {
            const events = [
                {
                    name: Durations.Events.WAITING,
                    condition: this.isWaiting(),
                    remaining: this.remaining - this.placingBet,
                    duration: this.wholeRound - this.remaining
                },
                {
                    name: Durations.Events.LOCKING_BET,
                    condition: this.isLocking(),
                    remaining: this.remaining,
                    duration: this.lockingBet - this.remaining
                },
                {
                    name: Durations.Events.PLACING_BET,
                    condition: this.isPlacingBet(),
                    remaining: this.remaining - this.lockingBet,
                    duration: this.placingBet - this.remaining
                }
            ];

            criteria.push(...events);
        }

        criteria.forEach(({ name, condition, remaining, duration }) => {
            if (condition) {
                this.emit(name, { remaining, globalRemaining: this.remaining, duration });
            }
        });
    }

    private calculateAndEmitStartupEvents() {
        const {
            BEGIN_LOCKING_BET,
            WAITING,
            BEGIN_PLACING_BET,
            BEGIN_SHOW_ANIMATION,
            BEGIN_WAITING,
            LOCKING_BET,
            PLACING_BET,
            SHOW_ANIMATION,
            STARTING_ROUND,
            BEGIN_STARTING_ROUND
        } = Durations.Events;

        const handleEmitEvent =
            (currentEvent: string, emitEvent: string) =>
            ({ duration }) => {
                const overrideDuration = (this.overrideEvent || { duration: 0 }).duration;
                this.latestEventCounter++;

                if (currentEvent !== this.latestEventName && (duration === 0 || duration - overrideDuration === 0)) {
                    this.latestEventCounter = 1;
                    this.latestEventName = currentEvent;
                    this.emit(emitEvent);
                }
            };

        this.on(WAITING, handleEmitEvent(WAITING, BEGIN_WAITING));
        this.on(PLACING_BET, handleEmitEvent(PLACING_BET, BEGIN_PLACING_BET));
        this.on(LOCKING_BET, handleEmitEvent(LOCKING_BET, BEGIN_LOCKING_BET));
        this.on(SHOW_ANIMATION, handleEmitEvent(SHOW_ANIMATION, BEGIN_SHOW_ANIMATION));
        this.on(STARTING_ROUND, handleEmitEvent(STARTING_ROUND, BEGIN_STARTING_ROUND));
    }

    isTimeOut(): boolean {
        return this.remaining === 0;
    }

    resetTimeForUM() {
        if (this.isTimeOut()) {
            this.remaining = this.wholeRound;
            this.start();
        }
    }
}
