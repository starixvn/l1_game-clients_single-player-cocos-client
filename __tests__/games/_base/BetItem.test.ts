import AudioManager from "../../../assets/common/audio/AudioManager";
import { userManager } from "../../../assets/common/user/UserManager";
import BetItem from "../../../assets/games/_base/view-models/BetItem";

describe("Test class BetItem", () => {
    let node: cc.Node;
    let betItem: BetItem;
    let item: any;
    let label: cc.Label;
    beforeEach(() => {
        AudioManager.getInstance().playClick = jest.fn();
        userManager.user.rate = 1;
        node = new cc.Node();
        node.name = "big";
        betItem = node.addComponent(BetItem);
        const ownBetLabel = new cc.Node().addComponent(cc.Label);
        const totalBetLabel = new cc.Node().addComponent(cc.Label);
        const oddsLabel = new cc.Node().addComponent(cc.Label);
        betItem.ownBet = ownBetLabel;
        betItem.totalBet = totalBetLabel;
        betItem.odds = oddsLabel;

        betItem.highlight = new cc.Node();

        item = betItem as any;

        label = new cc.Node().addComponent(cc.Label);
    });

    describe("setMoneyLabel", () => {
        it("should do nothing when inputBetChanged label is null", () => {
            // Arrange
            let isError = false;
            try {
                item.setMoneyLabel(null, 0);
            } catch (e) {
                isError = true;
            }

            // Assert
            expect(isError).toBe(false);
        });

        it("should empty when bet is zero", () => {
            // Arrange
            label.string = "default";

            // Act
            item.setMoneyLabel(label, 0);

            // Assert
            expect(label.string).toEqual("");
        });

        it("should bet value when bet is greater than zero", () => {
            // Arrange
            label.string = "default";

            // Act
            item.setMoneyLabel(label, 1000);

            // Assert
            expect(label.string).toEqual("1,000");
        });
    });

    describe("setTotalBet", () => {
        it("should call setMoneyLabel with totalBet label and bet value", () => {
            // Arrange
            const spy = jest.spyOn(item, "setMoneyLabel");

            // Act
            betItem.setTotalBet(1000);

            // Assert
            expect(spy).toBeCalledWith(betItem.totalBet, 1000);
            expect(betItem.totalBet.string).toEqual("1,000");
        });
    });

    describe("setOwnBet", () => {
        it("should call setMoneyLabel with ownBet label and bet value", () => {
            // Arrange
            const spy = jest.spyOn(item, "setMoneyLabel");

            // Act
            betItem.setOwnBet(1000);

            // Assert
            expect(spy).toBeCalledWith(betItem.ownBet, 1000);
            expect(betItem.ownBet.string).toEqual("1,000");
        });
    });

    describe("onBetClick", () => {
        it("should call betCallback with event", () => {
            // Arrange
            const spy = jest.spyOn(item, "betCallback");
            const event = {};

            // Act
            betItem.onBetClick(event);

            // Assert
            expect(spy).toBeCalledWith(event);
        });
    });

    describe("clearBet", () => {
        it("should call setOwnBet, setTotalBet with 0", () => {
            // Arrange
            const setOwnBetSpy = jest.spyOn(item, "setOwnBet");
            const setTotalBetSpy = jest.spyOn(item, "setTotalBet");

            // Act
            betItem.clearBet();

            // Assert
            expect(setOwnBetSpy).toBeCalledWith(0);
            expect(setTotalBetSpy).toBeCalledWith(0);
        });
    });

    describe("setData", () => {
        it("should call setTotalBet", () => {
            // Arrange
            const data = { totalBets: { big: 100 } };
            const setTotalBetSpy = jest.spyOn(item, "setTotalBet");

            // Act
            betItem.setData(data);

            // Assert
            expect(setTotalBetSpy).toBeCalledWith(100);
            expect(betItem.totalBet.string).toEqual("100");
        });

        it("should not call setTotalBet", () => {
            // Arrange
            const setTotalBetSpy = jest.spyOn(item, "setTotalBet");
            const data = { ownBets: { small: 100 } };

            // Act
            betItem.setData(data);

            // Assert
            expect(setTotalBetSpy).not.toBeCalled();
        });

        it("should call setOwnBet", () => {
            // Arrange
            const setOwnBetSpy = jest.spyOn(item, "setOwnBet");
            const data = { ownBets: { big: 10 } };

            // Act
            betItem.setData(data);

            // Assert
            expect(setOwnBetSpy).toBeCalledWith(10);
            expect(betItem.ownBet.string).toEqual("10");
        });

        it("should not call setOwnBet", () => {
            // Arrange
            const setOwnBetSpy = jest.spyOn(item, "setOwnBet");
            const data = { ownBets: { small: 10 } };

            // Act
            betItem.setData(data);

            // Assert
            expect(setOwnBetSpy).not.toBeCalled();
        });
    });

    describe("setOdd", () => {
        it("should set odds with format", () => {
            // Act
            betItem.setOdd("2.5");

            // Assert
            expect(betItem.odds.string).toEqual("1:2.5");
        });

        it("should do nothing when odds label null", () => {
            // Arrange
            let isError = false;

            // Act
            try {
                betItem.odds = null;
                betItem.setOdd("2.5");
            } catch (e) {
                isError = true;
            }

            // Assert
            expect(isError).toBe(false);
        });
    });

    describe("setHighlight", () => {
        it("should call setHighlightItems", () => {
            // Arrange
            const mock = jest.spyOn(item, "setHighlightItems");

            // Act
            betItem.setHighlight(true);

            // Assert
            expect(mock).toBeCalledWith(true, true);
        });
    });

    describe("resetHighlight", () => {
        it("should call setHighlightItems with false", () => {
            // Arrange
            betItem.highlightBackground = new cc.Node();
            betItem.highlightBorder = new cc.Node();
            betItem.normalBorder = new cc.Node();
            const mock = jest.spyOn(item, "setHighlightItems");

            // Act
            betItem.resetHighlight();

            // Assert
            expect(mock).toBeCalledWith(false);
        });
    });

    describe("setHighlightItems", () => {
        it("happy case", () => {
            // Arrange
            betItem.highlightBackground = new cc.Node();
            betItem.highlightBorder = new cc.Node();
            betItem.normalBorder = new cc.Node();

            // Act
            const fn = (highlight, animated) => {
                item.setHighlightItems(highlight, animated);

                expect(betItem.highlight.active).toEqual(highlight && animated);
                expect(betItem.highlightBackground.active).toEqual(highlight && animated);
                expect(betItem.normalBorder.active).toEqual(!highlight);
                expect(betItem.highlightBorder.active).toEqual(highlight);
            };

            // Assert
            fn(true, true);
            fn(true, false);
            fn(false, true);
            fn(false, false);
        });

        it("worst case", () => {
            // Arrange
            const fn = (highlight, animated) => {
                let isError = false;
                try {
                    betItem.highlightBackground = null;
                    betItem.normalBorder = null;
                    betItem.highlightBorder = null;
                    item.setHighlightItems(highlight, animated);
                } catch (e) {
                    isError = true;
                }

                expect(betItem.highlight.active).toEqual(highlight && animated);
                expect(isError).toBe(false);
            };

            fn(true, true);
            fn(true, false);
            fn(false, true);
            fn(false, false);
        });
    });

    describe("resetHighlightOptions", () => {
        it("should hide highlight border and background", () => {
            // Arrange
            betItem.highlightBackground = new cc.Node();
            betItem.highlightBorder = new cc.Node();
            betItem.normalBorder = new cc.Node();

            // Act
            item.resetHighlightOptions();

            // Assert
            expect(betItem.highlight.active).toEqual(false);
            expect(betItem.highlightBackground.active).toEqual(false);
        });

        it("should hide highlight border", () => {
            // Arrange
            betItem.highlightBackground = null;
            betItem.highlightBorder = new cc.Node();
            betItem.normalBorder = new cc.Node();

            // Act
            item.resetHighlightOptions();

            // Assert
            expect(betItem.highlight.active).toEqual(false);
        });
    });

    describe("setHighlightItemsOptions", () => {
        it("should ", () => {
            // Arrange
            betItem.highlightBackground = new cc.Node();
            betItem.highlightBorder = new cc.Node();
            betItem.normalBorder = new cc.Node();
            const fn = (highlight, animated) => {
                item.setHighlightItemsOptions(highlight, animated);

                expect(betItem.highlight.active).toEqual(highlight && animated);
                expect(betItem.highlightBackground.active).toEqual(highlight && animated);
                expect(betItem.normalBorder.active).toEqual(!highlight);
                expect(betItem.highlightBorder.active).toEqual(highlight && !animated);
            };

            fn(true, true);
            fn(true, false);
            fn(false, true);
            fn(false, false);
        });

        it("worst case", () => {
            betItem.highlightBackground = new cc.Node();
            betItem.highlightBorder = null;
            betItem.normalBorder = new cc.Node();
            const fn = (highlight, animated?) => {
                let isError = false;
                let result = highlight;
                try {
                    betItem.highlightBackground = null;
                    betItem.normalBorder = null;
                    betItem.highlightBorder = null;
                    if (animated !== undefined) {
                        result = highlight && animated;
                        item.setHighlightItems(highlight, animated);
                    } else {
                        item.setHighlightItems(highlight);
                    }
                } catch (e) {
                    isError = true;
                }

                expect(betItem.highlight.active).toEqual(result);
                expect(isError).toBe(false);
            };

            fn(true, true);
            fn(true, false);
            fn(false, true);
            fn(false, false);
            fn(true, undefined);
            fn(false, undefined);
        });
    });
});
