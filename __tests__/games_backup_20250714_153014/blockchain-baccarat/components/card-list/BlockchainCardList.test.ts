import { BlockchainCardModel, CardModel } from "../../../../../assets/games/blockchain-baccarat/BlockchainBaccaratType";
import BlockchainCard from "../../../../../assets/games/blockchain-baccarat/components/card-list/view-models/BlockchainCard";
import BlockchainCardList from "../../../../../assets/games/blockchain-baccarat/components/card-list/view-models/BlockchainCardList";
import { Blockchain } from "../../../../../assets/games/blockchain-baccarat/event-models/BlockchainBaccaratCardListModel";
import { mockFuntions } from "../../../../mocks/TestUtils";

jest.mock("../../../../../assets/common/GameUtils", () => ({
    default: class {
        public static createNodeFromPrefab() {
            return mockFuntions.createNodeFromPrefab();
        }
    }
}));
jest.mock("i18n/runtime-scripts/LanguageData");
describe("Test class BlockchainCardVerification", () => {
    let node: cc.Node;
    let comp: BlockchainCardList;
    let content: cc.Node;
    let statsScrollView: cc.ScrollView;

    function createCardModel() {
        const card: CardModel = {
            rank: "3",
            suit: 2
        };
        return card;
    }

    function createBlockchainCardModel() {
        const blockchainCardModel: BlockchainCardModel = {
            card: createCardModel(),
            hashValue: "9a58c07d34d3395b50788c78b59a4669b088baac3dda48e1e71f122369b03792",
            rawValue:
                "2♥_2022-07-05T06:21:28.226Z_bfb9a44cd5ae07c4a09d11feef40f61a2dd921bc3a48428e54ab8c970ef2d82e_917dcf20-4f61-44d3-bf32-c687e2bd7781",
            revealedRawValue: "81"
        };
        return blockchainCardModel;
    }

    function createBlockchainCardModel2() {
        const blockchainCardModel: BlockchainCardModel = {
            card: createCardModel(),
            hashValue: "c93aa3b46457c972f726f14bd206e15464de8b55f4002e472bc173a47612d6fa",
            rawValue:
                "8♦_2022-07-05T06:21:28.235Z_275474cc50e8fbe44609660372c2e421e45f9c068fdec4eabf6734f6e6e62fc8_2bf01e3e-2ec9-4079-991f-889aa7147f7b",
            revealedRawValue: "81"
        };
        return blockchainCardModel;
    }

    const chain: BlockchainCardModel[] = [];
    chain.push(createBlockchainCardModel2());
    chain.push(createBlockchainCardModel());
    chain.push(createBlockchainCardModel2());
    chain.push(createBlockchainCardModel());
    chain.push(createBlockchainCardModel2());
    chain.push(createBlockchainCardModel());
    chain.push(createBlockchainCardModel2());
    chain.push(createBlockchainCardModel());
    chain.push(createBlockchainCardModel2());
    chain.push(createBlockchainCardModel());
    chain.push(createBlockchainCardModel2());
    chain.push(createBlockchainCardModel());
    chain.push(createBlockchainCardModel2());
    chain.push(createBlockchainCardModel());

    function createBlockchain() {
        const blockchain: Blockchain = {
            burnedCards: 2,
            currentIndex: 3,
            cutCardIndex: 5,
            chain: chain
        };
        return blockchain;
    }

    beforeEach(() => {
        node = new cc.Node();
        content = new cc.Node();
        statsScrollView = new cc.ScrollView();
        comp = node.addComponent(BlockchainCardList);
        comp.content = content;
        comp.statsScrollView = statsScrollView;

        mockFuntions.createNodeFromPrefab = () => {
            const cardNode = new cc.Node();
            const cardComp = cardNode.addComponent(BlockchainCard);
            cardComp.setKeyCard = jest.fn();
            cardComp.setFaceUp = jest.fn();
            cardComp.setCardOldStyle = jest.fn();
            cardComp.setIndexNumber = jest.fn();
            cardComp.setShadow = jest.fn();
            cardComp.setHighlight = jest.fn();
            cardComp.resetHighLightCard = jest.fn();
            cardComp.highLightCard = jest.fn();
            return cardNode;
        };

        comp.blockchain = createBlockchain();
    });

    describe("setData", () => {
        it("should create card list", () => {
            // Arrange
            comp.setData = BlockchainCardList.prototype.setData;
            comp.scrollToCard = jest.fn();

            // Act
            comp.setData();

            // Assert
            expect(comp.cards.length).toEqual(15);
        });
    });

    describe("highLightCurrentCardSelected", () => {
        it("should high light card", () => {
            // Arrange
            comp.cards = [];
            comp.highLightCurrentCardSelected = BlockchainCardList.prototype.highLightCurrentCardSelected;
            comp.scrollToCard = jest.fn();
            comp.setData();
            const anyComp = comp as any;
            const resetHighLightCurrentCardSelected = jest.spyOn(anyComp, "resetHighLightCurrentCardSelected");
            // Act
            comp.highLightCurrentCardSelected(5);

            // Assert
            expect(comp.cardSelected).toEqual(6);
            expect(resetHighLightCurrentCardSelected).toBeCalled();
            expect(comp.cards[6].getComponent(BlockchainCard).highLightCard).toBeCalled();
        });
    });

    describe("calculateDisplayIndex", () => {
        it.each`
            input  | expectedResult
            ${5}   | ${1}
            ${25}  | ${3}
            ${413} | ${35}
        `("card index $input: card row $expectedResult", ({ input, expectedResult }) => {
            expect(comp.calculateDisplayIndex(input)).toBe(expectedResult);
        });
    });
});
