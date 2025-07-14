import BetDetailFrame from "../../../assets/common/new-history/BetDetailFrame";
import BetDetailTable from "../../../assets/common/new-history/BetDetailTable";
import { BetLog } from "../../../assets/games/hi-lo/view-models/HiLoBetData";
import HiLoTicketDetail from "../../../assets/games/hi-lo/view-models/HiLoTicketDetail";
import HiLoTicketDetailBaseItem from "../../../assets/games/hi-lo/view-models/HiLoTicketDetailBaseItem";
import HiLoTicketDetailItem from "../../../assets/games/hi-lo/view-models/HiLoTicketDetailItem";
import { mockFuntions } from "../../mocks/TestUtils";

jest.mock("../../../assets/common/GameUtils", () => ({
    default: class {
        public static createNodeFromPrefab() {
            return mockFuntions.createNodeFromPrefab();
        }
    }
}));

describe("HiLoTicketdetail", () => {
    let node: cc.Node;
    let comp: HiLoTicketDetail;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(HiLoTicketDetail);
        comp.content = new cc.Node();
        comp.scrollView = node.addComponent(cc.ScrollView);
        comp.roundId = node.addComponent(cc.Label);
        comp.betDetailFrame = node.addComponent(BetDetailFrame);
        comp.betDetailTable = node.addComponent(BetDetailTable);
        comp.mainFrame = new cc.Node();

        mockFuntions.createNodeFromPrefab = () => {
            const node = new cc.Node();
            HiLoTicketDetailItem.prototype.renderTicketDetailItem = jest.fn();
            node.addComponent(HiLoTicketDetailItem);
            return node;
        };
    });

    function createLogDetail(order) {
        return {
            amount: 50,
            betwin: 52.5,
            cards: [
                { suit: 0, rank: "K" },
                { suit: 3, rank: "3" }
            ],
            choice: "l",
            order,
            time: "2022-02-18T08:29:06.789Z"
        };
    }

    describe("updateContentTicketDetail", () => {
        let betLog: BetLog;

        beforeEach(() => {
            comp.renderDetailBase = jest.fn();

            betLog = {
                time: "2022-02-17T04:28:11.289Z",
                id: 1966,
                amount: 100,
                betwin: 233.44,
                betLogDetails: [createLogDetail(1)],
                endTime: ""
            };
        });

        it("should set roundId.string base on data", () => {
            // Arrange

            // Act
            comp.updateContentTicketDetail(betLog);

            // Assert
            expect(comp.roundId.string).toStrictEqual(betLog.id.toString());
        });
        it("should add start round to content", () => {
            // Arrange
            const actualValue = comp.content.getComponent(HiLoTicketDetailBaseItem);

            // Act
            comp.updateContentTicketDetail(betLog);

            // Assert
            expect(actualValue).toBeDefined();
        });
    });

    describe("calculateHeights", () => {
        describe("when contentHeight > this.maxHeightContent", () => {
            it("should set scrollView.node.height = maxHeightContent, set correct detailTable.height", () => {
                // Arrange
                const betLogDetails = [
                    createLogDetail(1),
                    createLogDetail(2),
                    createLogDetail(3),
                    createLogDetail(4),
                    createLogDetail(5),
                    createLogDetail(6),
                    createLogDetail(7),
                    createLogDetail(8),
                    createLogDetail(9),
                    createLogDetail(10)
                ];

                // Act
                comp.calculateHeights(betLogDetails);

                // Assert
                expect(comp.scrollView.node.height).toEqual(400);
            });
        });

        describe("when contentHeight = this.maxHeightContent", () => {
            it("should set scrollView.node.height = maxHeightContent, should set correct detailTable.height", () => {
                // Arrange
                comp.contentHeight = 110;
                const betLogDetails = [
                    createLogDetail(1),
                    createLogDetail(2),
                    createLogDetail(3),
                    createLogDetail(4),
                    createLogDetail(5),
                    createLogDetail(6),
                    createLogDetail(7),
                    createLogDetail(8)
                ];

                // Act
                comp.calculateHeights(betLogDetails);

                //Assert
                expect(comp.scrollView.node.height).toEqual(400);
            });
        });

        describe("when contentHeight < this.maxHeightContent", () => {
            it("should set scrollView.node.height = maxHeightContent, should set correct detailTable.height", () => {
                // Arrange
                const betLogDetails = [createLogDetail(1), createLogDetail(2), createLogDetail(3)];
                comp.contentHeight = 110;

                // Act
                comp.calculateHeights(betLogDetails);

                // Assert
                expect(comp.scrollView.node.height).toEqual(260);
            });
        });
    });

    describe("renderDetailBase", () => {
        it("should set Data to HiLoTicketDetailBaseItem", () => {
            // Arrange
            comp.renderDetailBase = HiLoTicketDetail.prototype.renderDetailBase;
            const spyFunction = jest.fn();
            mockFuntions.createNodeFromPrefab = () => {
                const node = new cc.Node();
                HiLoTicketDetailBaseItem.prototype.setData = spyFunction;
                node.addComponent(HiLoTicketDetailBaseItem);
                return node;
            };

            const betLog: BetLog = {
                time: "2022-02-17T04:28:11.289Z",
                id: 1966,
                amount: 100,
                betwin: 233.44,
                betLogDetails: [],
                endTime: ""
            };

            //Act
            comp.renderDetailBase(betLog, false, 0);

            //Assert
            expect(HiLoTicketDetailBaseItem.prototype.setData).toHaveBeenCalled();
        });
    });

    describe("renderTicketDetail", () => {
        it("should update data for content, calculate height for content and table", () => {
            // Arrange
            const betLog: BetLog = {
                time: "2022-02-17T04:28:11.289Z",
                id: 1966,
                amount: 100,
                betwin: 233.44,
                betLogDetails: [createLogDetail(1)],
                endTime: ""
            };
            comp.updateContentTicketDetail = jest.fn();
            comp.calculateHeights = jest.fn();
            comp.betDetailFrame.updateSizeFrame = jest.fn();
            comp.betDetailTable.updateSize = jest.fn();

            // Act
            comp.renderTicketDetail(betLog);

            // Assert
            expect(comp.updateContentTicketDetail).toBeCalledWith(betLog);
            expect(comp.calculateHeights).toBeCalledWith(betLog.betLogDetails);
            expect(comp.betDetailFrame.updateSizeFrame).toBeCalledWith(comp.mainFrame.width, 250);
            expect(comp.betDetailTable.updateSize).toBeCalledWith(1122, 160);
        });
    });
});
