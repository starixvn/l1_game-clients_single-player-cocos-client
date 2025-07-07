import PaginationCommon from "../../../assets/common/helpers/Pagination/PaginationCommon";
import { TicketHistoryData } from "../../../assets/games/hi-lo/view-models/HiLoBetData";
import HiLoTicketDetail from "../../../assets/games/hi-lo/view-models/HiLoTicketDetail";
import HiLoTicketHistory from "../../../assets/games/hi-lo/view-models/HiLoTicketHistory";
import HiLoTicketHistoryItem from "../../../assets/games/hi-lo/view-models/HiLoTicketHistoryItem";
import { mockFuntions } from "../../mocks/TestUtils";

jest.mock("../../../assets/common/GameUtils", () => ({
    default: class {
        public static createNodeFromPrefab() {
            return mockFuntions.createNodeFromPrefab();
        }
    }
}));

jest.mock("../../../assets/common/helpers/Pagination/PaginationCommon", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            onSet: jest.fn(),
            handleActionPage: jest.fn(),
            init: jest.fn()
        };
    })
}));

jest.mock("../../../assets/games/_new/connection/SocketIOConnection", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            emit: jest.fn()
        };
    })
}));

jest.mock(".../../../assets/games/_new/connection/Connection", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            emit: jest.fn()
        };
    })
}));

function createBetLog(id) {
    return {
        amount: 50,
        betwin: 52.5,
        endTime: "2022-02-24T06:48:58.151Z",
        time: "2022-02-18T08:29:06.789Z",
        id,
        betLogDetails: []
    };
}

describe("HiLoTicketHistory", () => {
    let node: cc.Node;
    let comp: HiLoTicketHistory;
    let ticketHistoryData: TicketHistoryData;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(HiLoTicketHistory);
        comp.content = new cc.Node();
        comp.pages = new PaginationCommon();
        //comp.connection = new Connection();
        mockFuntions.createNodeFromPrefab = () => {
            const node = new cc.Node();
            HiLoTicketHistoryItem.prototype.renderTicketItem = jest.fn();
            node.addComponent(HiLoTicketHistoryItem);
            return node;
        };
        ticketHistoryData = {
            betLogs: [createBetLog(1), createBetLog(2)],
            page: 1,
            pageSize: 8,
            total: 3
        };
    });

    describe("renderTicketHisroty", () => {
        it("should add data into ticket history", () => {
            // Arrange
            comp.pages.onSet = jest.fn();

            //Act
            comp.renderTicketHistory(ticketHistoryData);

            //Assert
            expect(comp.content.children.length).toEqual(2);
        });
    });

    describe("initTicketDetail", () => {
        it("should called renderTicketDetail function", () => {
            // Arrange
            mockFuntions.createNodeFromPrefab = () => {
                const node = new cc.Node();
                HiLoTicketDetail.prototype.renderTicketDetail = jest.fn();
                node.addComponent(HiLoTicketDetail);
                return node;
            };

            //Act
            comp.initTicketDetail(ticketHistoryData.betLogs[0]);

            //Assert
            expect(HiLoTicketDetail.prototype.renderTicketDetail).toBeCalledWith(ticketHistoryData.betLogs[0]);
        });
    });
});
