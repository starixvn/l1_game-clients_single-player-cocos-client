import { GameData } from "../../_new/_base/game-data-management/models/game-data";
import SpinButtonStateModel from "./SpinButtonStateModel";

export default class FeatureSlotGameData extends GameData {
    static Events = {};

    spinButtonStateModel: SpinButtonStateModel;

    constructor() {
        super();
        this.spinButtonStateModel = new SpinButtonStateModel();
    }
}
