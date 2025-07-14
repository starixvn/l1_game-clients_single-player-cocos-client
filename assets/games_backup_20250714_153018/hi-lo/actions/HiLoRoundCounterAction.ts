import { HiLoRoundCounter } from "../events-models/HiLoRoundCounter";

export const updateRoundId = (gameRound: cc.Label) => (roundCounter: HiLoRoundCounter) => {
    if (gameRound) {
        gameRound.string = `#${roundCounter.roundId}`;
    }
};
