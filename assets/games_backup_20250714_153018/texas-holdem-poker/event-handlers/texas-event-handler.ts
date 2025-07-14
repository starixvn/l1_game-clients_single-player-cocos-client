import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import TexasGameDataModel from "../event-models/texas-game-data-model";

export default class TexasEventHandler<Event> extends BaseEventHandler<Event> {
    protected readonly gameData: TexasGameDataModel;
}
