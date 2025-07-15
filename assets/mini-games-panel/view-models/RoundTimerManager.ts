import NotificationService from "../../common/auth/NotificationService";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { RoundTimerData } from "./RoundTimerData";
import { RoundTimerEvents } from "./RoundTimerEvents";



export default class RoundTimerManager {
    private static instance: RoundTimerManager;
    private readonly roundTimer = "roundTimer";
    private readonly latestRoundTimer = "latestRoundTimer";
    private disabledGames = [];
    public roundData = null;

    constructor() {
        
        this.initEvents();
        
    }

    public static getInstance(): RoundTimerManager {
        
        if (!this.instance) {
            
            this.instance = new RoundTimerManager();
        } else {
            
        }

        return this.instance;
    }

    requestRoundTimer() {
        
        NotificationService.getInstance().emitEvent(RoundTimerEvents.GET_ROUND_TIMER, {});
        
    }

    initEvents() {
        
        NotificationService.getInstance().addDataObserver(RoundTimerEvents.ROUND_TIMER, this.roundTimer, this.onReceivedData.bind(this));
        NotificationService.getInstance().addDataObserver(
            RoundTimerEvents.LATEST_ROUND_TIMER,
            this.latestRoundTimer,
            this.onReceivedData.bind(this)
        );
        
    }

    removeEvents() {
        
        NotificationService.getInstance().removeDataObserver(this.roundTimer, this.roundTimer);
        NotificationService.getInstance().removeDataObserver(this.latestRoundTimer, this.latestRoundTimer);
        
    }

    private onReceivedData(data: RoundTimerData) {
        
        this.roundData = data;
        
        uiManager.emitter.emit(InternalEvents.RECEIVED_ROUND_TIMER, data);
        
    }

    addDisabledGames(gameId: number) {
        
        this.disabledGames.push(gameId);
        
    }

    removeDisabledGames(gameId: number) {
        
        const initialCount = this.disabledGames.length;
        this.disabledGames = this.disabledGames.filter((value) => value !== gameId);
        const finalCount = this.disabledGames.length;
        
        
    }

    isDisabledGame(gameId: number) {
        const isDisabled = this.disabledGames.includes(gameId);
        
        return isDisabled;
    }
}


export const roundTimerManager = RoundTimerManager.getInstance();

