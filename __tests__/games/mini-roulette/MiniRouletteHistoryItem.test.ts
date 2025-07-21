import MiniRouletteBetHistoryItem from "../../../assets/games/_roulette-s/scripts/bet-history/mini-roulette-bet-history-item";

describe("Test class MiniRouletteHistoryItem", () => {
    let node: cc.Node;
    let comp: MiniRouletteBetHistoryItem;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(MiniRouletteBetHistoryItem);
        comp.time = new cc.Node().addComponent(cc.Label);
        comp.bg = new cc.Node();
        comp.round = new cc.Node().addComponent(cc.Label);
        comp.amountLabel = new cc.Node().addComponent(cc.Label);
        comp.win = new cc.Node().addComponent(cc.Label);
    });

    describe("Test method setData", () => {
        it("Case: ", () => {
            // Arrange
            const log = {
                freeBet: false,
                phien: 532830,
                betwin: 3,
                dozen: {
                    "1": 1
                },
                name: "cruz",
                odds: {
                    straightUp: 36,
                    split: 18,
                    street: 12,
                    triangle: 12,
                    corner: 9,
                    fourNumbers: 9,
                    line: 6,
                    column: 3,
                    dozen: 3,
                    redBlack: 2,
                    oddEven: 2,
                    bigSmall: 2
                },
                redBlack: {
                    red: 1
                },
                time: "2021-10-05T07:56:12.446Z",
                totalAmount: 5,
                result: 10,
                settlementResult: {
                    straightUp: ["10"],
                    split: ["7-10", "10-11", "10-13"],
                    street: ["10-11-12"],
                    triangle: [],
                    corner: ["7-8-10-11", "10-11-13-14"],
                    fourNumbers: [],
                    line: ["7-8-9-10-11-12", "10-11-12-13-14-15"],
                    column: ["1"],
                    dozen: ["1"],
                    redBlack: ["black"],
                    oddEven: ["even"],
                    bigSmall: ["small"]
                },
                betLogDetails: [
                    {
                        time: "2021-10-05T07:56:12.444Z",
                        redBlack: {
                            red: 1
                        },
                        dozen: {
                            "1": 1
                        }
                    }
                ]
            };

            // Act
            comp.setData(log, 0);

            // Assert
            expect(comp.round.string).toMatch(log.phien.toString());
        });
    });
});
