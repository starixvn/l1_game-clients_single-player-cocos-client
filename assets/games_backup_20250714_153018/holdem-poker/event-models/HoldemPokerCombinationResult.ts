import { HoldemPokerCardModel } from "./HoldemPokerCardModel";

export class HoldemPokerCombinationResult {
  playerResult: CardResult;
  dealerResult: CardResult;
  isQualified: boolean;
}
export class CardResult {
  handResultId: number;
  combinationCards: HoldemPokerCardModel[];
}

export class HandTicketDetail {
  handResultId: number;
  cards: HoldemPokerCardModel[];
  combinationCards: HoldemPokerCardModel[];
  isQualified: boolean;
}
