import NoticeUtil from "../../../common/utils/NoticeUtil";
import { EmitterEvents, Store } from "../models/definitions";
import { GameData } from "../models/gateway-game-data";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class ConnectionErrorRender extends RenderItem {
    private _gameData: GameData = null;

    init(data: GameData) {
        this.node.active = false;

        this._gameData = data;
        const store = data.getStore(Store.DisableGame);
        store?.addListener(EmitterEvents.ConnectionFailed, this.onChangeConnectionFailed);

        store?.wakeUp();
    }

    onDestroy() {
        const store = this._gameData?.getStore(Store.DisableGame);
        store?.removeListener(EmitterEvents.ConnectionFailed, this.onChangeConnectionFailed);
    }

    onChangeConnectionFailed = (isFailed: boolean) => {
        cc.log("onChangeConnectionFailed", isFailed);
        this.node.active = isFailed;

        const label = this.getComponentInChildren(cc.Label);
        if (label) {
            label.string = NoticeUtil.getLocalizedErrorMessage("SB0010", {});
        }
    };
}
