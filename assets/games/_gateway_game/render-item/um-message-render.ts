import { EmitterEvents, Store } from "../models/definitions";
import { GameData } from "../models/gateway-game-data";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UmMessageRender extends RenderItem {
    private _gameData: GameData = null;

    init(data: GameData) {
        this.node.active = false;

        this._gameData = data;
        const store = data.getStore(Store.DisableGame);
        store?.addListener(EmitterEvents.UmMessage, this.onChangeUmMessage);
        store?.addListener(EmitterEvents.DisabledGame, this.onChangeDisabledGame);

        store?.wakeUp();
    }

    onDestroy() {
        const store = this._gameData?.getStore(Store.DisableGame);
        store?.removeListener(EmitterEvents.UmMessage, this.onChangeUmMessage);
        store?.removeListener(EmitterEvents.DisabledGame, this.onChangeDisabledGame);
    }

    onChangeDisabledGame = (data: boolean) => {
        cc.log("onChangeDisabledGame", data);
        this.node.active = data;
    };

    onChangeUmMessage = (message: string) => {
        const label = this.getComponentInChildren(cc.Label);
        if (label) {
            label.string = message;
        }
    };
}
