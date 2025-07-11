import NotificationService from "../../common/auth/NotificationService";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { RoundTimerData } from "./RoundTimerData";
import { RoundTimerEvents } from "./RoundTimerEvents";

console.log("[RoundTimerManager] Loading RoundTimerManager module...");

export default class RoundTimerManager {
    private static instance: RoundTimerManager;
    private readonly roundTimer = "roundTimer";
    private readonly latestRoundTimer = "latestRoundTimer";
    private disabledGames = [];
    public roundData = null;

    constructor() {
        console.log("[RoundTimerManager] RoundTimerManager constructor called");
        this.initEvents();
        console.log("[RoundTimerManager] RoundTimerManager initialized");
    }

    public static getInstance(): RoundTimerManager {
        console.log("[RoundTimerManager] Getting RoundTimerManager instance");
        if (!this.instance) {
            console.log("[RoundTimerManager] Creating new RoundTimerManager instance");
            this.instance = new RoundTimerManager();
        } else {
            console.log("[RoundTimerManager] Returning existing RoundTimerManager instance");
        }

        return this.instance;
    }

    requestRoundTimer() {
        console.log("[RoundTimerManager] Requesting round timer...");
        NotificationService.getInstance().emitEvent(RoundTimerEvents.GET_ROUND_TIMER, {});
        console.log("[RoundTimerManager] Round timer request sent");
    }

    initEvents() {
        console.log("[RoundTimerManager] Initializing events...");
        NotificationService.getInstance().addDataObserver(RoundTimerEvents.ROUND_TIMER, this.roundTimer, this.onReceivedData.bind(this));
        NotificationService.getInstance().addDataObserver(
            RoundTimerEvents.LATEST_ROUND_TIMER,
            this.latestRoundTimer,
            this.onReceivedData.bind(this)
        );
        console.log("[RoundTimerManager] Events initialized successfully");
    }

    removeEvents() {
        console.log("[RoundTimerManager] Removing events...");
        NotificationService.getInstance().removeDataObserver(this.roundTimer, this.roundTimer);
        NotificationService.getInstance().removeDataObserver(this.latestRoundTimer, this.latestRoundTimer);
        console.log("[RoundTimerManager] Events removed successfully");
    }

    private onReceivedData(data: RoundTimerData) {
        console.log("[RoundTimerManager] Received round timer data:", data);
        this.roundData = data;
        console.log("[RoundTimerManager] Round data updated");
        uiManager.emitter.emit(InternalEvents.RECEIVED_ROUND_TIMER, data);
        console.log("[RoundTimerManager] Emitted RECEIVED_ROUND_TIMER event");
    }

    addDisabledGames(gameId: number) {
        console.log("[RoundTimerManager] Adding disabled game:", gameId);
        this.disabledGames.push(gameId);
        console.log("[RoundTimerManager] Disabled games count:", this.disabledGames.length);
    }

    removeDisabledGames(gameId: number) {
        console.log("[RoundTimerManager] Removing disabled game:", gameId);
        const initialCount = this.disabledGames.length;
        this.disabledGames = this.disabledGames.filter((value) => value !== gameId);
        const finalCount = this.disabledGames.length;
        console.log("[RoundTimerManager] Disabled games removed:", initialCount - finalCount);
        console.log("[RoundTimerManager] Current disabled games count:", finalCount);
    }

    isDisabledGame(gameId: number) {
        const isDisabled = this.disabledGames.includes(gameId);
        console.log("[RoundTimerManager] Checking if game is disabled:", gameId, "Result:", isDisabled);
        return isDisabled;
    }
}

console.log("[RoundTimerManager] Creating RoundTimerManager instance...");
export const roundTimerManager = RoundTimerManager.getInstance();
console.log("[RoundTimerManager] RoundTimerManager module loaded successfully");
