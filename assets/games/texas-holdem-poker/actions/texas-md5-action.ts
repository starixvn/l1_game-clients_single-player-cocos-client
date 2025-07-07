import CasinoMD5 from "../../_casino/CasinoMD5";
import { MD5ModelBase } from "../../_casino/event-models/MD5ModelBase";
import { TexasState } from "../texas-type";
import Texas from "../view-models/texas";
import TexasStateModel from "./../event-models/texas-state-model";

export const handleMD5 = (main: Texas) => (stateModel: TexasStateModel) => {
    switch (stateModel.state) {
        case TexasState.replay_new:
        case TexasState.blank_new:
        case TexasState.calling_fold:
        case TexasState.calling_deal:
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
