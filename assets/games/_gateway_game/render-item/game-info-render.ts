import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { EmitterEvents, Store } from "../models/definitions";
import { GameData } from "../models/gateway-game-data";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameInfoRender extends RenderItem {
    @property(cc.Label)
    labelRTP: cc.Label = null;

    @property(cc.Label)
    labelTotalOnlineUsers: cc.Label = null;

    @property(cc.Label)
    labelMinBet: cc.Label = null;

    @property(cc.Label)
    labelMaxBet: cc.Label = null;

    private _gameData: GameData = null;
    init(data: GameData) {
        this._gameData = data;
        const store = data.getStore(Store.GameInfo);
        store?.addListener(EmitterEvents.RtpChange, this.onChangeRTP);
        store?.addListener(EmitterEvents.TotalOnlineChange, this.onChangeTotalOnlineUser);
        store?.addListener(EmitterEvents.BetLimitChange, this.onChangeBetLimit);
    }

    onDestroy() {
        const store = this._gameData?.getStore(Store.GameInfo);
        store?.removeListener(EmitterEvents.RtpChange, this.onChangeRTP);
        store?.removeListener(EmitterEvents.TotalOnlineChange, this.onChangeTotalOnlineUser);
        store?.removeListener(EmitterEvents.BetLimitChange, this.onChangeBetLimit);
    }

    onChangeBetLimit = (data: { minBet: number; maxBet: number }) => {
        if (!data) {
            return;
        }
        if (this.labelMinBet) {
            this.labelMinBet.string = numberWithCommas(data.minBet);
        }
        if (this.labelMaxBet) {
            this.labelMaxBet.string = numberWithCommas(data.maxBet);
        }
    };
    onChangeTotalOnlineUser = (data: number) => {
        if (!this.labelTotalOnlineUsers) {
            return;
        }
        this.labelTotalOnlineUsers.string = numberWithCommas(data);
    };
    onChangeRTP = (data: number) => {
        if (!this.labelRTP) {
            return;
        }
        this.labelRTP.string = `${numberWithCommas(data, 2)}%`;
    };
}
