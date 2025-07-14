import CasinoMD5 from "../../_casino/CasinoMD5";
import { MD5ModelBase } from "../../_casino/event-models/MD5ModelBase";
import { HoldemPokerState } from "../event-models/HoldemPokerState";
import { HoldemPokerStateModel } from "../event-models/HoldemPokerStateModel";
import HoldemPoker from "../view-models/HoldemPoker";

export const handleMD5 = (main: HoldemPoker) => (stateModel: HoldemPokerStateModel) => {
    switch (stateModel.state) {
        case HoldemPokerState.replay_new:
        case HoldemPokerState.blank_new:
        case HoldemPokerState.calling_fold:
        case HoldemPokerState.calling_deal:
            main.md5Component.resetMd5();
            break;

        default:
            break;
    }
};

export const updateMD5 = (md5Comp: CasinoMD5) => (model: MD5ModelBase) => {
    if (typeof model.md5 === "string") {
        md5Comp.setMD5String(model.md5);
    }
};
