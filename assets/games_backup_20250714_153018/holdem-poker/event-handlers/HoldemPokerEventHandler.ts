import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";

export default class HoldemPokerEventHandler<Event> extends BaseEventHandler<Event> {
    protected readonly gameData: HoldemPokerGameData;
}
