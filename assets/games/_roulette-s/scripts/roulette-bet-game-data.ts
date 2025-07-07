import SoloGameData from "../../_solo_game/solo-game-data";
import { RouletteBetModel } from "./roulette-bet-model";

export class RouletteGameData extends SoloGameData {
    protected initModels() {
        super.initModels();
        this.betModel = new RouletteBetModel();
    }
}
