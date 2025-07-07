import BaccaratBigRoad from "../../_baccarat/view-models/BaccaratBigRoad";
import { EmitterEvents, Store } from "../models/definitions";
import { GameData } from "../models/gateway-game-data";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreboardRender extends RenderItem {
    @property(BaccaratBigRoad)
    scoreboard: BaccaratBigRoad = null;

    private _gameData: GameData = null;
    init(data: GameData) {
        this._gameData = data;
        const store = data.getStore(Store.RoundHistory);
        store?.addListener(EmitterEvents.RoundHistoryChange, this.onData);

        const infoStore = data.getStore(Store.GameInfo);
        infoStore?.addListener(EmitterEvents.LockingBet, this.showNextNode);
    }

    onDestroy() {
        const store = this._gameData?.getStore(Store.RoundHistory);
        store?.removeListener(EmitterEvents.RoundHistoryChange, this.onData);

        const infoStore = this._gameData?.getStore(Store.GameInfo);
        infoStore?.removeListener(EmitterEvents.LockingBet, this.showNextNode);
    }

    showNextNode = () => {
        this.scoreboard.renderNextNode();
    };

    onData = (data: any) => {
        this.scoreboard.clearNextNode();
        if (data.length === 0) {
            this.scoreboard.resetBoard();
        } else {
            this.scoreboard.renderScoreBoardInGame(data);
        }
    };
}
