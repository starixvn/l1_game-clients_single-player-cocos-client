console.log("[Analytics] Loading AnalyticsManager module...");

export enum TrackingEvent {
    Button = "Button_Event"
}

export enum TrackingAction {
    ToggleOn = "ToggleOn",
    ToggleOff = "ToggleOff",
    Click = "Click",
    Show = "Show"
}

interface TrackingParameter {
    location?: string;
    action?: string;
    object_name?: string;
    game_name?: string;
}

declare global {
    interface Window {
        gtag: any;
    }
}

export default class AnalyticsManager {
    static _instance: AnalyticsManager;
    static get Instance() {
        console.log("[Analytics] Getting AnalyticsManager instance");
        if (!this._instance) {
            console.log("[Analytics] Creating new AnalyticsManager instance");
            this._instance = new AnalyticsManager();
            this._instance.initialize();
        } else {
            console.log("[Analytics] Returning existing AnalyticsManager instance");
        }

        return this._instance;
    }

    private _gtag: (type: string, detail: string, params: TrackingParameter) => void;

    constructor() {
        console.log("[Analytics] AnalyticsManager constructor called");
    }

    private initialize(): void {
        console.log("[Analytics] Initializing AnalyticsManager...");
        this._gtag = window.gtag;
        console.log("[Analytics] gtag function available:", !!this._gtag);
        console.log("[Analytics] AnalyticsManager initialization completed");
    }

    trackEvent(event: string, params: TrackingParameter) {
        console.log("[Analytics] Tracking event:", event, "with params:", params);
        if (this._gtag) {
            console.log("[Analytics] Calling gtag with event:", event);
            this._gtag("event", event, params);
            console.log("[Analytics] Event tracked successfully");
        } else {
            console.warn("[Analytics] gtag not available, event not tracked");
        }
    }
}

console.log("[Analytics] AnalyticsManager module loaded successfully");
