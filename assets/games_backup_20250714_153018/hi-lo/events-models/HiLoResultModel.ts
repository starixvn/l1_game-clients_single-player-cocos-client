import { HiLoOwnBetsModel } from "./HiLoOwnBetsModel";
export class HiLoResultModel extends HiLoOwnBetsModel {
    static Events = {
        CHANGE: "result:change"
    };
}
