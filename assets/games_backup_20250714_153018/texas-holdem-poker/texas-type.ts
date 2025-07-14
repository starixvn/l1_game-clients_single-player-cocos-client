export enum TexasState {
    blank_new = 0,
    prepare_new,
    replay_new,
    ante_bet,
    calling_deal,
    dealing,
    dealt,
    swap,
    swapping,
    swapped,
    hold,
    holding,
    held,
    calling_call,
    calling_called,
    calling_fold,
    calling_turning,
    calling_turned,
    calling_rivering,
    calling_check_turn,
    calling_check_river,
    settled
}

export type TexasChoicesType = {
    anteBet: number;
    callBet: number;
    turnBet: number;
    riverBet: number;
    ante: number;
    aa: number;
    call: number;
};
