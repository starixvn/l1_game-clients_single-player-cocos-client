import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import NoticeUtil from "../../../common/utils/NoticeUtil";
import IGameBase from "../IGameBase";
import DataHandler from "./DataHandler";

export default class GameBaseNoticeHandler implements DataHandler {
    constructor(protected readonly main: IGameBase) {}

    handle(data: any) {
        if (!data.notice) {
            return;
        }

        const { errorCode, hedgeBetGroup, minBet, maxBet, gameRoundId, gameTypeId } = data.notice;
        const gameName = GameUtils.getGameNameString(gameTypeId);

        if (!gameRoundId || gameRoundId === this.main.roundId) {
            const opt = { gameName, gameRoundId, errorCode, minBet: numberWithCommas(minBet), maxBet: numberWithCommas(maxBet) };

            if (hedgeBetGroup && hedgeBetGroup.length > 0) {
                hedgeBetGroup.forEach((choice, index) => {
                    opt[`betChoice${index + 1}`] = this.main.getBetChoiceString(choice);
                });
            }

            const text = NoticeUtil.getLocalizedErrorMessage(errorCode, opt);
            if (text) {
                this.main.showMiniWarning(text);
            }
        }
    }
}
