import * as i18n from "i18n/runtime-scripts/LanguageData";

import BlockchainBaccaratLastRoundInfo from "../../../../../assets/games/blockchain-baccarat/components/last-round-info/view-models/BlockchainBaccaratLastRoundInfo";
import { BlockchainBaccaratRoundHistory } from "../../../../../assets/games/blockchain-baccarat/event-models/BlockchainBaccaratRoundHistory";
import BlockchainBaccaratCardsUI from "../../../../../assets/games/blockchain-baccarat/view-models/BlockchainBaccaratCardsUI";

jest.mock("i18n/runtime-scripts/LanguageData", () => {
    return {
        t: jest.fn((parm) => {
            return parm;
        })
    };
});

window.modules = { i18n };

describe("BlockchainBaccaratLastRoundInfo", () => {
    let node: cc.Node;
    let comp: BlockchainBaccaratLastRoundInfo;

    beforeEach(() => {
        node = new cc.Node();
        const winNotice = new cc.Node();
        const parentWinLabel = new cc.Node();
        parentWinLabel.addChild(winNotice);
        comp = node.addComponent(BlockchainBaccaratLastRoundInfo);
        comp.cardsUI = new cc.Node();
        comp.playerCard3 = new cc.Node();
        comp.bankerCard3 = new cc.Node();
        comp.winNoticeLabel = winNotice.addComponent(cc.Label);
    });

    describe("reset", () => {
        it("should run expected", () => {
            // act
            comp.reset();

            // assert
            expect(comp.cardsUI.active).toBe(false);
            expect(comp.winNoticeLabel.node.getParent().active).toBe(false);
        });
    });

    describe("updateUI", () => {
        beforeEach(() => {
            comp["updateCards"] = jest.fn();
            comp["updateWinNoticeLabel"] = jest.fn();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        describe("when lastRound null", () => {
            beforeEach(() => {
                // act
                comp.updateUI(null, 0);
            });
            it("should not call updateCards", () => {
                // assert
                expect(comp["updateCards"]).not.toHaveBeenCalled();
            });
            it("should not call updateWinNoticeLabel", () => {
                // assert
                expect(comp["updateWinNoticeLabel"]).not.toHaveBeenCalled();
            });
        });

        describe("when lastRound has data", () => {
            const lastRound: BlockchainBaccaratRoundHistory = {
                roundId: 1,
                result: {
                    player: { card1: { rank: "1", suit: 1 }, card2: { rank: "1", suit: 1 }, card3: { rank: "1", suit: 1 } },
                    banker: { card1: { rank: "1", suit: 2 }, card2: { rank: "1", suit: 2 }, card3: { rank: "3", suit: 2 } }
                },
                settlementResult: {
                    player: false,
                    banker: true,
                    tie: false,
                    small: false,
                    big: true,
                    playerPair: true,
                    bankerPair: true,
                    natural: false
                }
            };
            const currentIndex = 10;

            beforeEach(() => {
                // arrange

                // act
                comp.updateUI(lastRound, currentIndex);
            });

            it("should call updateCards", () => {
                // assert
                expect(comp["updateCards"]).toHaveBeenCalled();
            });
            it("should call updateWinNoticeLabel", () => {
                // act
                comp.updateUI(lastRound, currentIndex);

                // assert
                expect(comp["updateWinNoticeLabel"]).toHaveBeenCalled();
            });
        });
    });

    describe("updateCards", () => {
        beforeEach(() => {
            comp.cardsUI.addComponent(BlockchainBaccaratCardsUI);
            comp.cardsUI.getComponent(BlockchainBaccaratCardsUI).showCardsWithoutAnimation = jest.fn();
        });

        const lastRound: BlockchainBaccaratRoundHistory = {
            roundId: 1,
            result: {
                player: { card1: { rank: "1", suit: 1 }, card2: { rank: "1", suit: 1 }, card3: { rank: "1", suit: 1 } },
                banker: { card1: { rank: "1", suit: 2 }, card2: { rank: "1", suit: 2 }, card3: { rank: "3", suit: 2 } }
            },
            settlementResult: {
                player: false,
                banker: true,
                tie: false,
                small: false,
                big: true,
                playerPair: true,
                bankerPair: true,
                natural: false
            }
        };

        it("should show cardsUI", () => {
            // act
            comp["updateCards"](lastRound, 0);

            // assert
            expect(comp.cardsUI.active).toBe(true);
        });

        it("should call showCardsWithoutAnimation", () => {
            // act
            comp["updateCards"](lastRound, 0);

            // assert
            expect(comp.cardsUI.getComponent(BlockchainBaccaratCardsUI).showCardsWithoutAnimation).toHaveBeenCalled();
        });

        describe("when card3 of player has data", () => {
            it("should show card3 of player", () => {
                // act
                comp["updateCards"](lastRound, 0);

                // assert
                expect(comp.playerCard3.active).toBe(true);
            });
        });

        describe("when card3 of player has null", () => {
            it("should show card3 of player", () => {
                // arrange
                lastRound.result.player.card3 = null;

                // act
                comp["updateCards"](lastRound, 0);

                // assert
                expect(comp.playerCard3.active).toBe(false);
            });
        });

        describe("when card3 of banker has data", () => {
            it("should show card3 of banker", () => {
                // act
                comp["updateCards"](lastRound, 0);

                // assert
                expect(comp.bankerCard3.active).toBe(true);
            });
        });

        describe("when card3 of banker has null", () => {
            it("should show card3 of banker", () => {
                // assign
                lastRound.result.banker.card3 = null;

                // act
                comp["updateCards"](lastRound, 0);

                // assert
                expect(comp.bankerCard3.active).toBe(false);
            });
        });
    });

    describe("updateWinNoticeLabel", () => {
        let settlementResult;
        beforeEach(() => {
            settlementResult = {
                player: false,
                banker: true,
                tie: false,
                small: false,
                big: true,
                playerPair: true,
                bankerPair: true,
                natural: false
            };
        });

        it("should show win notice", () => {
            // act
            comp["updateWinNoticeLabel"](settlementResult);

            // assert
            expect(comp.winNoticeLabel.node.getParent().active).toBe(true);
        });

        describe("when banker win", () => {
            it("should display win notice is Banker Win", () => {
                // act
                comp["updateWinNoticeLabel"](settlementResult);

                // assert
                expect(comp.winNoticeLabel.string).toBe(i18n.t(comp["winNotice"].banker).toUpperCase());
            });
        });

        describe("when player win", () => {
            it("should display win notice is Player Win", () => {
                // arrange
                settlementResult.player = true;
                settlementResult.banker = false;

                // act
                comp["updateWinNoticeLabel"](settlementResult);

                // assert
                expect(comp.winNoticeLabel.string).toBe(i18n.t(comp["winNotice"].player).toUpperCase());
            });
        });
    });
});
