import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import HiLoGameData from "../events-models/HiLoGameData";

export default class HiLoEventHandler<Event> extends BaseEventHandler<Event> {
    protected readonly gameData: HiLoGameData;
}
