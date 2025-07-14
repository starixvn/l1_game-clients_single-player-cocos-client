import TexasChoicesModel from "./event-models/texas-choices-model";
import { cloneDeep } from "lodash";

type Choices = {
    ante?: number;
    call?: number;
    turn?: number;
    river?: number;
};

export const convertChoices = (inputChoices: Choices) => {
    const choices = new TexasChoicesModel();
    if (!!inputChoices.ante) {
        choices.anteBet = inputChoices.ante;
    }

    if (!!inputChoices.call) {
        choices.callBet = inputChoices.call;
    }

    if (!!inputChoices.turn) {
        choices.turnBet = inputChoices.turn;
    }

    if (!!inputChoices.river) {
        choices.riverBet = inputChoices.river;
    }

    return choices;
};

export const cloneDeepChoiceData = (data: Record<string, number>) => {
    const result: any = {};
    result["anteBet"] = cloneDeep(data["ante"]);
    result["callBet"] = cloneDeep(data["call"]);
    result["riverBet"] = cloneDeep(data["river"]);
    result["turnBet"] = cloneDeep(data["turn"]);

    return result;
};
