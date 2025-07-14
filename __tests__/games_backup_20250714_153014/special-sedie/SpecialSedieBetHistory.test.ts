import { getStringDateByTime } from "../../../assets/common/helpers/DateTimeHelper";
import SpecialSedieBetHistory from "../../../assets/games/special-sedie/view-models/SpecialSedieBetHistory";

describe("Test class SpecialSedieBetHistory", () => {
    let node: cc.Node;
    let comp: SpecialSedieBetHistory;

    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(SpecialSedieBetHistory);
        comp.roundIdLabel = new cc.Node().addComponent(cc.Label);
        comp.redDot = new cc.SpriteFrame();
        comp.whiteDot = new cc.SpriteFrame();
        comp.nextButton = new cc.Node();
        comp.dots = new cc.Node();
        comp.leftContent = new cc.Node();
        comp.rightContent = new cc.Node();
        comp.leftResultNode = new cc.Node();
        comp.rightResultNode = new cc.Node();
        comp.leftBetAmount = new cc.Node().addComponent(cc.Label);
        comp.leftRefundAmount = new cc.Node().addComponent(cc.Label);
        comp.rightBetAmount = new cc.Node().addComponent(cc.Label);
        comp.rightRefundAmount = new cc.Node().addComponent(cc.Label);

        for (let i = 0; i < 4; i++) {
            const dot = new cc.Node().addComponent(cc.Sprite);
            comp.dots.addChild(dot.node);
        }
    });

    describe("Test method onData", () => {
        it("Case: ", () => {
            // Arrange
            const data = {
                time: "2021-10-08T03:23:59.004Z",
                id: 787997,
                result: {
                    red1: true,
                    red2: true,
                    red3: true,
                    red4: true
                },
                settlementResult: {
                    odd: false,
                    even: true
                },
                __v: 0,
                __archive: {
                    eventtime: "2021-10-08T03:23:59.004Z"
                },
                total: {
                    odd: {
                        betAmount: 11422,
                        refund: 0
                    },
                    even: {
                        betAmount: 15465,
                        refund: 4043
                    }
                }
            };
            const anyComp = comp as any;
            const updateDotsResultSpy = jest.spyOn(anyComp, "updateDotsResult");

            // Act
            comp.onData(data);

            // Assert
            expect(comp.roundIdLabel.string).toMatch(`${data.id} - ${getStringDateByTime(data.time)}`);
            expect(updateDotsResultSpy).toBeCalledWith(data.result);
        });
    });

    describe("Test method updateDotsResult", () => {
        it("Case: ", () => {
            // Arrange
            const result = {
                red1: true,
                red2: true,
                red3: true,
                red4: false
            };

            // Act
            comp.updateDotsResult(result);

            // Assert
            Object.keys(result).forEach((key, index) => {
                const dot = comp.dots.children[index]?.getComponent(cc.Sprite);
                dot.spriteFrame = result[key] ? comp.redDot : comp.whiteDot;
            });
        });
    });
});
