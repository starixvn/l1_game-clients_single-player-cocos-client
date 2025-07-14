import GameUtils from "../../../common/GameUtils";
import { HoldemPokerRoundCounter } from "../event-models/HoldemPokerRoundCounter";

export const updateRoundId = (gameRound: cc.Label) => (roundCounter: HoldemPokerRoundCounter) => {
    if (gameRound) {
        gameRound.string = `#${roundCounter.roundId}`;
        const newPosX = GameUtils.isIpad() ? gameRound.node.position.x + 70 : gameRound.node.position.x;
        gameRound.node.position = cc.v3(newPosX, gameRound.node.position.y, gameRound.node.position.z);
    }
};
