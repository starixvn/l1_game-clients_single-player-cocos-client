import * as cryptoJs from "crypto";
import * as i18n from "i18n/runtime-scripts/LanguageData";

import { BlockchainCardModel, CardModel } from "../../../../../assets/games/blockchain-baccarat/BlockchainBaccaratType";
import BlockchainCardVerification, {
    CardVerificationState
} from "../../../../../assets/games/blockchain-baccarat/components/card-list/view-models/BlockchainCardVerification";
import BlockchainCardVerificationItem from "../../../../../assets/games/blockchain-baccarat/components/card-list/view-models/BlockchainCardVerificationItem";
import BlockchainCardVerify from "../../../../../assets/games/blockchain-baccarat/components/card-list/view-models/BlockchainCardVerify";

window.modules = { i18n, cryptoJs };

jest.mock("i18n/runtime-scripts/LanguageData");
describe("Test class BlockchainCardVerification", () => {
    let node: cc.Node;
    let cardVerificationComp: BlockchainCardVerification;
    let equalTag: cc.Node;

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

    beforeEach(() => {
        node = new cc.Node();
        equalTag = new cc.Node();
        cardVerificationComp = node.addComponent(BlockchainCardVerification);
        cardVerificationComp.serialNumber = node.addComponent(BlockchainCardVerificationItem);
        cardVerificationComp.privateKey = node.addComponent(BlockchainCardVerificationItem);
        cardVerificationComp.verifiedSerial = node.addComponent(BlockchainCardVerificationItem);
        cardVerificationComp.verifyCard = node.addComponent(BlockchainCardVerify);
        cardVerificationComp.equalTag = equalTag;

        cardVerificationComp.verifiedSerial.resetHighLight = jest.fn();
        cardVerificationComp.verifiedSerial.enableCopyButton = jest.fn();
        cardVerificationComp.verifiedSerial.setHashValue = jest.fn();
        cardVerificationComp.serialNumber.resetHighLight = jest.fn();
        cardVerificationComp.serialNumber.setHashValue = jest.fn();
        cardVerificationComp.serialNumber.renderCard = jest.fn();
        cardVerificationComp.privateKey.resetHighLight = jest.fn();
        cardVerificationComp.privateKey.enableCopyButton = jest.fn();
        cardVerificationComp.privateKey.setTextCopy = jest.fn();
        cardVerificationComp.verifyCard.setStatusVerify = jest.fn();
        cardVerificationComp.privateKey.renderCard = jest.fn();
        cardVerificationComp.privateKey.setRawValue = jest.fn();
        cardVerificationComp.verifiedSerial.setHighLightSuccess = jest.fn();
        cardVerificationComp.verifiedSerial.setHighLightFailed = jest.fn();
        cardVerificationComp.serialNumber.setHighLightSuccess = jest.fn();
        cardVerificationComp.serialNumber.setHighLightFailed = jest.fn();
        cardVerificationComp.verifyCard.setVerifySuccess = jest.fn();

        const equal = new cc.Node();
        cardVerificationComp.equalTag.addChild(equal, 1, "equal");

        const notEqual = new cc.Node();
        cardVerificationComp.equalTag.addChild(notEqual, 1, "not-equal");
    });

    describe("Test method renderVerifiedSerialNumber", () => {
        it("Case: ", () => {
            // Act
            cardVerificationComp.renderVerifiedSerialNumber();

            // Assert
            expect(cardVerificationComp.verifiedSerial.resetHighLight).toBeCalled();
            expect(cardVerificationComp.verifiedSerial.enableCopyButton).toBeCalledWith(false);
            expect(cardVerificationComp.verifiedSerial.setHashValue).toBeCalled();
        });
    });

    describe("Test method onClickRenderCardVerification", () => {
        it("Case: CardVerificationState equal serialChange", () => {
            //arrange
            const blockchainCardModel = createBlockchainCardModel();
            cardVerificationComp.state = CardVerificationState.serialChange;
            const anyComp = cardVerificationComp as any;

            const renderSerialNumber = jest.spyOn(anyComp, "renderSerialNumber");
            // Act
            cardVerificationComp.onClickRenderCardVerification(blockchainCardModel, 12);

            // Assert
            expect(renderSerialNumber).toBeCalledWith(blockchainCardModel, 12);
        });

        it("Case: CardVerificationState equal privateChange", () => {
            //arrange
            const blockchainCardModel = createBlockchainCardModel();
            cardVerificationComp.state = CardVerificationState.privateChange;
            const anyComp = cardVerificationComp as any;

            const renderPrivateKey = jest.spyOn(anyComp, "renderPrivateKey");
            // Act
            cardVerificationComp.onClickRenderCardVerification(blockchainCardModel, 12);

            // Assert
            expect(renderPrivateKey).toBeCalledWith(blockchainCardModel, 12);
        });

        it("Case: CardVerificationState equal blankNew", () => {
            //arrange
            const blockchainCardModel = createBlockchainCardModel();
            cardVerificationComp.state = CardVerificationState.blankNew;
            const anyComp = cardVerificationComp as any;

            const renderSerialNumber = jest.spyOn(anyComp, "renderSerialNumber");
            const renderPrivateKey = jest.spyOn(anyComp, "renderPrivateKey");
            // Act
            cardVerificationComp.onClickRenderCardVerification(blockchainCardModel, 12);

            // Assert
            expect(renderSerialNumber).toBeCalledWith(blockchainCardModel, 12);
            expect(renderPrivateKey).toBeCalledWith(blockchainCardModel, 12);
        });
    });

    describe("Test method autoRenderCardVerification", () => {
        it("Case: render serialNumber", () => {
            //arrange
            const blockchainCardModel = createBlockchainCardModel();
            cardVerificationComp.numberKey = 12;
            const anyComp = cardVerificationComp as any;

            const renderSerialNumber = jest.spyOn(anyComp, "renderSerialNumber");
            // Act
            cardVerificationComp.autoRenderCardVerification(blockchainCardModel, 12);

            // Assert
            expect(renderSerialNumber).toBeCalledWith(blockchainCardModel, 12);
        });

        it("Case: render privateKey", () => {
            //arrange
            const blockchainCardModel = createBlockchainCardModel();
            cardVerificationComp.numberKey2 = 13;
            const anyComp = cardVerificationComp as any;

            const renderPrivateKey = jest.spyOn(anyComp, "renderPrivateKey");
            // Act
            cardVerificationComp.autoRenderCardVerification(blockchainCardModel, 13);

            // Assert
            expect(renderPrivateKey).toBeCalledWith(blockchainCardModel, 13);
        });
    });

    describe("Test method setPrivateKey", () => {
        it("Case: render serialNumber", () => {
            //arrange
            const card = createCardModel();
            const rawValue =
                "4♠_2022-07-05T05:36:40.164Z_37171ba07fec93c441c350bdf5fb7acbc4ab93bd90bd15a0d853f8eb518d4c8e_9206680a-0df1-448b-808d-5780dbec9085";
            const expected =
                "<color=#98b2e5>4♣</color>_2022-07-05T05:36:40.164Z_37171ba07fec93c441c350bdf5fb7acbc4ab93bd90bd15a0d853f8eb518d4c8e_920668 0a-0df1-448b-808d-5780dbec9085";
            // Act
            const actual = cardVerificationComp.setPrivateKey(rawValue, card);

            // Assert
            expect(actual).toMatch(expected);
        });
    });

    describe("Test method renderButton", () => {
        it("Case: private card is available", () => {
            //arrange
            const rawValue =
                "2♥_2022-07-05T06:21:28.226Z_bfb9a44cd5ae07c4a09d11feef40f61a2dd921bc3a48428e54ab8c970ef2d82e_917dcf20-4f61-44d3-bf32-c687e2bd7781";
            cardVerificationComp.blockchainCardPrivate = createBlockchainCardModel();
            // Act
            cardVerificationComp.renderButton();

            // Assert
            expect(cardVerificationComp.privateKey.enableCopyButton).toBeCalledWith(true);
            expect(cardVerificationComp.privateKey.setTextCopy).toBeCalledWith(rawValue);
            expect(cardVerificationComp.privateKey.enableCopyButton).toBeCalledWith(true);
        });

        it("Case: private card is unavailable", () => {
            //arrange
            cardVerificationComp.blockchainCardPrivate = null;

            // Act
            cardVerificationComp.renderButton();

            // Assert
            expect(cardVerificationComp.privateKey.enableCopyButton).toBeCalledWith(false);
            expect(cardVerificationComp.privateKey.enableCopyButton).toBeCalledWith(false);
        });
    });

    describe("Test method onClickVerifyButton", () => {
        beforeEach(() => {
            cardVerificationComp.onHideTooltips = jest.fn();
        });
        it("Case: verify success", () => {
            //arrange
            cardVerificationComp.blockchainCardPrivate = createBlockchainCardModel();
            cardVerificationComp.blockchainCardSerial = createBlockchainCardModel();
            const anyComp = cardVerificationComp as any;
            const onHideTooltips = jest.spyOn(anyComp, "onHideTooltips");
            const setStatusEqualTag = jest.spyOn(anyComp, "setStatusEqualTag");
            // Act
            cardVerificationComp.onClickVerifyButton();

            // Assert
            expect(onHideTooltips).toBeCalled();
            expect(cardVerificationComp.verifyCard.setVerifySuccess).toBeCalledWith(true);
            expect(cardVerificationComp.serialNumber.setHighLightSuccess).toBeCalled();
            expect(cardVerificationComp.verifiedSerial.setHighLightSuccess).toBeCalled();
            expect(setStatusEqualTag).toBeCalledWith(true);
        });

        it("Case: verify failed", () => {
            //arrange
            cardVerificationComp.blockchainCardPrivate = createBlockchainCardModel();
            cardVerificationComp.blockchainCardSerial = createBlockchainCardModel2();
            const anyComp = cardVerificationComp as any;
            const onHideTooltips = jest.spyOn(anyComp, "onHideTooltips");
            const setStatusEqualTag = jest.spyOn(anyComp, "setStatusEqualTag");
            // Act
            cardVerificationComp.onClickVerifyButton();

            // Assert
            expect(onHideTooltips).toBeCalled();
            expect(cardVerificationComp.verifyCard.setVerifySuccess).toBeCalledWith(false);
            expect(cardVerificationComp.serialNumber.setHighLightFailed).toBeCalled();
            expect(cardVerificationComp.verifiedSerial.setHighLightFailed).toBeCalled();
            expect(setStatusEqualTag).toBeCalledWith(false);
        });
    });
});
