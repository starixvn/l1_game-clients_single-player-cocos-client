import MiniRouletteTicketDetail from "../../../assets/games/_roulette-s/scripts/bet-history/mini-roulette-ticket-detail";

describe("Test class MiniRouletteTicketDetail", () => {
    let node: cc.Node;
    let comp: MiniRouletteTicketDetail;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(MiniRouletteTicketDetail);
        comp.roundLabel = new cc.Node().addComponent(cc.Label);
        comp.resultLabel = new cc.Node().addComponent(cc.Label);
        comp.profitLabel = new cc.Node().addComponent(cc.Label);
        comp.content = new cc.Node();
        comp.itemPrefab = new cc.Prefab();
        comp.totalItemPrefab = new cc.Prefab();
    });

    describe("Test method setRouletteData", () => {
        it("should set round and result labels correctly", () => {
            // Arrange
            const result = 36;
            const round = 532942;

            // Act
            comp.setRouletteData(round, result);

            // Assert
            expect(comp.roundLabel.string).toMatch(round.toString());
            expect(comp.resultLabel.string).toMatch(result.toString());
        });
    });

    describe("Test method setDetailData", () => {
        it("should set detail data correctly", () => {
            // Arrange
            const betLogDetails = [{ bet: 100, choice: "red" }];
            const settlementResult = { win: 200 };
            const data = {
                odds: { red: 2, black: 2 },
                totalBet: 100,
                totalWin: 200
            };

            // Act
            comp.setDetailData(betLogDetails, settlementResult, data);

            // Assert
            expect(comp.betLogDetails).toEqual(betLogDetails);
            expect(comp.settlementResult).toEqual(settlementResult);
            expect(comp.odds).toEqual(data.odds);
            expect(comp.totalBet).toBe(data.totalBet);
            expect(comp.totalWin).toBe(data.totalWin);
        });
    });

    describe("Test method createProfit", () => {
        it("should set profit label with positive profit", () => {
            // Arrange
            comp.totalBet = 100;
            comp.totalWin = 200;

            // Act
            comp.createProfit();

            // Assert
            expect(comp.profitLabel.string).toBe("100"); // numberWithCommas(100) = "100"
            expect(comp.profitLabel.node.color).toEqual(cc.Color.YELLOW);
        });

        it("should set profit label with negative profit", () => {
            // Arrange
            comp.totalBet = 200;
            comp.totalWin = 100;

            // Act
            comp.createProfit();

            // Assert
            expect(comp.profitLabel.string).toBe("-100"); // numberWithCommas(-100) = "-100"
            expect(comp.profitLabel.node.color).toEqual(cc.Color.WHITE);
        });

        it("should handle null profit label", () => {
            // Arrange
            comp.profitLabel = null;
            comp.totalBet = 100;
            comp.totalWin = 200;

            // Act & Assert - should not throw error
            expect(() => comp.createProfit()).not.toThrow();
        });

        it("should handle zero profit", () => {
            // Arrange
            comp.totalBet = 100;
            comp.totalWin = 100;

            // Act
            comp.createProfit();

            // Assert
            expect(comp.profitLabel.string).toBe("0"); // numberWithCommas(0) = "0"
            expect(comp.profitLabel.node.color).toEqual(cc.Color.WHITE); // 0 is not positive
        });
    });

    describe("Test method createTotalItem", () => {
        it("should create total item correctly", () => {
            // Arrange
            comp.totalBet = 100;
            comp.totalWin = 200;
            
            const mockAddChild = jest.fn();
            comp.content.addChild = mockAddChild;
            
            const mockTotalItemComponent = {
                createTotalItem: jest.fn()
            };
            const mockInstantiate = jest.fn().mockReturnValue({
                getComponent: jest.fn().mockReturnValue(mockTotalItemComponent)
            });
            cc.instantiate = mockInstantiate;

            // Act
            comp.createTotalItem();

            // Assert
            expect(mockInstantiate).toHaveBeenCalledWith(comp.totalItemPrefab);
            expect(mockTotalItemComponent.createTotalItem).toHaveBeenCalledWith(100, 200);
            expect(mockAddChild).toHaveBeenCalledTimes(1);
        });
    });

    describe("Test default values", () => {
        it("should have correct default values", () => {
            // Assert
            expect(comp.roundID).toBe(2000);
            expect(comp.result).toBe(20);
            expect(comp.HEIGHT_BET_DETAIL_TABLE).toBe(550);
            expect(comp.WIDTH_BET_DETAIL_TABLE).toBe(930);
        });
    });
});
