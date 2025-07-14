import { numberWithCommas } from "../../../assets/common/helpers/NumberHelper";
import MiniSedieHistoryItem from "../../../assets/games/muliplay-mini-sedie/scripts/MiniSedieHistoryItem";

describe("Test class MiniSedieHistoryItem", () => {
    let node: cc.Node;
    let comp: MiniSedieHistoryItem;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(MiniSedieHistoryItem);
        comp.bg = new cc.Node();
        comp.kqSprite = new cc.Node().addComponent(cc.Sprite);
        comp.kqLabel = new cc.Node().addComponent(cc.Label);
        comp.time = new cc.Node().addComponent(cc.Label);
        comp.round = new cc.Node().addComponent(cc.Label);
        comp.win = new cc.Node().addComponent(cc.Label);
        comp.odd = new cc.Node().addComponent(cc.Label);
        comp.even = new cc.Node().addComponent(cc.Label);
        comp.red3 = new cc.Node().addComponent(cc.Label);
        comp.red4 = new cc.Node().addComponent(cc.Label);
        comp.white3 = new cc.Node().addComponent(cc.Label);
        comp.white4 = new cc.Node().addComponent(cc.Label);
    });
    describe("Test method setData", () => {
        it("Case: ", () => {
            // Arrange
            const betLog = {
                freeBet: false,
                phien: 910634,
                roundId: 910634,
                betwin: 1.96,
                even: 1,
                name: "lele6001",
                odd: 1,
                odds: {
                    even: 1.96,
                    odd: 1.96,
                    red3: 3.75,
                    white3: 3.75,
                    red4: 14.4,
                    white4: 14.4
                },
                red3: 0,
                red4: 0,
                time: "2021-10-05T04:05:29.507Z",
                white3: 1,
                white4: 1,
                result: {
                    red1: true,
                    red2: false,
                    red3: true,
                    red4: false
                },
                settlementResult: {
                    odd: false,
                    even: true,
                    red3: false,
                    red4: false,
                    white3: false,
                    white4: false
                },
                betLogDetails: []
            };

            // Act
            comp.setData(betLog, 1);

            // Assert
            Object.keys(betLog.settlementResult).forEach((choice) => {
                comp[choice].string = numberWithCommas(betLog[choice]);
                if (betLog.settlementResult[choice]) {
                    comp[choice].node.color = cc.Color.YELLOW;
                } else {
                    comp[choice].node.color = cc.Color.WHITE;
                }
            });
        });
    });
});
