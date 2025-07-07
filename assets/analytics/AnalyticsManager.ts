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
        if (!this._instance) {
            this._instance = new AnalyticsManager();
            this._instance.initialize();
        }

        return this._instance;
    }

    private _gtag: (type: string, detail: string, params: TrackingParameter) => void;

    private initialize(): void {
        this._gtag = window.gtag;
    }

    trackEvent(event: string, params: TrackingParameter) {
        this._gtag && this._gtag("event", event, params);
    }
}
