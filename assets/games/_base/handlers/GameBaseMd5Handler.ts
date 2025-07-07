import IGameBase from "../IGameBase";
import DataHandler from "./DataHandler";

export default class GameBaseMd5Handler implements DataHandler {
    constructor(protected readonly main: IGameBase) {}

    resultHash: any;

    handle(data: any) {
        if (data.md5) {
            this.main.md5Component?.updateMD5WithDelay(data.md5);
        }

        if (data.resultHash) {
            this.resultHash = data.resultHash;

            if (this.main.syncShowingMD5WithResult && this.resultHash.rawValue) {
                const isShowingResult = this.main.inSettlementSequence || !this.main.finishShowResult;
                if (!isShowingResult) {
                    this.main.md5Component?.updateMD5Data(this.resultHash);
                }
            } else {
                this.main.md5Component?.updateMD5WithDelay(this.resultHash);
            }
        }
    }
}
