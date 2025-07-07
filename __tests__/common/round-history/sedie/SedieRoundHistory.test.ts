import SedieRoundHistory from "../../../../assets/common/round-history/sedie/SedieRoundHistory";

describe("Test class SedieRoundHistory", () => {
    let node: cc.Node;
    let comp: SedieRoundHistory;
    let anyComp: any;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(SedieRoundHistory);
        anyComp = comp as any;
        comp.even = new cc.Node().addComponent(cc.Label);
        comp.odd = new cc.Node().addComponent(cc.Label);
        comp.red3 = new cc.Node().addComponent(cc.Label);
        comp.red4 = new cc.Node().addComponent(cc.Label);
        comp.white3 = new cc.Node().addComponent(cc.Label);
        comp.white4 = new cc.Node().addComponent(cc.Label);
    });
    describe("Test method setData", () => {
        it("Case 1: redData has nothing", () => {
            // Arrange
            const updateHistorySpy = jest.spyOn(anyComp, "updateHistory");

            const redData = [];

            // Act
            comp.setData(redData);

            // Assert
            expect(updateHistorySpy).toBeCalledWith(redData);
            expect(comp.odd.string).toMatch("0%");
            expect(comp.even.string).toMatch("0%");
            expect(comp.red3.string).toMatch("0%");
            expect(comp.red4.string).toMatch("0%");
            expect(comp.white3.string).toMatch("0%");
            expect(comp.white4.string).toMatch("0%");
        });

        it("Case 2: redData has data", () => {
            // Arrange
            const updateHistorySpy = jest.spyOn(anyComp, "updateHistory");

            const redData = [2, 2, 3, 2, 3, 4, 3, 2, 1, 3, 3];
            const total = redData.length;
            const suffix = "%";
            let oddCount = 0,
                red3Count = 0,
                red4Count = 0,
                white3Count = 0,
                white4Count = 0;
            redData.forEach((i) => {
                switch (i) {
                    case 0:
                        white4Count++;
                        break;
                    case 1:
                        white3Count++;
                        oddCount++;
                        break;
                    case 3:
                        red3Count++;
                        oddCount++;
                        break;
                    case 4:
                        red4Count++;
                        break;
                }
            });

            const oddValue = Math.round((oddCount * 100) / total);
            const evenValue = 100 - oddValue;
            const red3Value = Math.round((red3Count * 100) / total);
            const red4Value = Math.round((red4Count * 100) / total);
            const white3Value = oddValue - red3Value;
            const white4Value = Math.round((white4Count * 100) / total);

            // Act
            comp.setData(redData);

            // Assert
            expect(updateHistorySpy).toBeCalledWith(redData);
            expect(comp.odd.string).toMatch(`${oddValue}${suffix}`);
            expect(comp.even.string).toMatch(`${evenValue}${suffix}`);
            expect(comp.red3.string).toMatch(`${red3Value}${suffix}`);
            expect(comp.red4.string).toMatch(`${red4Value}${suffix}`);
            expect(comp.white3.string).toMatch(`${white3Value}${suffix}`);
            expect(comp.white4.string).toMatch(`${white4Value}${suffix}`);
        });
    });
});
