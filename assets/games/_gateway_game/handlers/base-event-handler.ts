import { GameData } from "../models/gateway-game-data";

export class BaseEventHandler<Event> {
    protected readonly gameData: GameData;

    constructor(gameData: GameData) {
        this.gameData = gameData;
    }

    onReceiveEvent(event: Event) {
        if (this.verifyEvent(event)) {
            this.handle(event);
        }
    }

    protected verifyEvent(event: Event): boolean {
        return true;
    }

    protected handle(event: Event) {
        // handle
    }
}
