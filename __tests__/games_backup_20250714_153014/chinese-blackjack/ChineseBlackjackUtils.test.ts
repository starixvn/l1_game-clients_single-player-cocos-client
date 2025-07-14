import ChineseBlackjackUtils from "../../../assets/games/chinese-blackjack/view-models/ChineseBlackjackUtils";

describe("ChineseBlackjackUtils", () => {
    describe("isBanLuck", () => {
        test('should return true for "10" and "A"', () => {
            //Arrange
            const cards = [
                { rank: "10", suit: 1 },
                { rank: "A", suit: 1 }
            ];

            // Assert
            expect(ChineseBlackjackUtils.isBanLuck(cards)).toBe(true);
        });

        test('should return false for "Q" and "A"', () => {
            //Arrange
            const cards = [
                { rank: "Q", suit: 1 },
                { rank: "A", suit: 1 }
            ];

            // Assert
            expect(ChineseBlackjackUtils.isBanLuck(cards)).toBe(true);
        });

        test("should return false for more than 2 cards", () => {
            //Arrange
            const cards = [
                { rank: "10", suit: 1 },
                { rank: "J", suit: 1 },
                { rank: "A", suit: 1 }
            ];

            // Assert
            expect(ChineseBlackjackUtils.isBanLuck(cards)).toBe(false);
        });
    });

    describe("isBanBan", () => {
        test('should return true for two "A" cards', () => {
            //Arrange
            const cards = [
                { rank: "A", suit: 1 },
                { rank: "A", suit: 1 }
            ];

            // Assert
            expect(ChineseBlackjackUtils.isBanBan(cards)).toBe(true);
        });

        test("should return false for other card ranks", () => {
            //Arrange
            const cards = [
                { rank: "A", suit: 1 },
                { rank: "K", suit: 1 }
            ];

            // Assert
            expect(ChineseBlackjackUtils.isBanBan(cards)).toBe(false);
        });
    });

    describe("isFiveCards", () => {
        test("should return true for total <= 21 and 5 cards", () => {
            //Arrange
            const cards = [
                { rank: "2", suit: 1 },
                { rank: "3", suit: 1 },
                { rank: "4", suit: 1 },
                { rank: "5", suit: 1 },
                { rank: "7", suit: 1 }
            ];
            const total = 21;

            // Assert
            expect(ChineseBlackjackUtils.isFiveCards(cards, total)).toBe(true);
        });

        test("should return false for total > 21 and 5 cards", () => {
            //Arrange
            const cards = [
                { rank: "10", suit: 1 },
                { rank: "J", suit: 1 },
                { rank: "Q", suit: 1 },
                { rank: "K", suit: 1 },
                { rank: "A", suit: 1 }
            ];
            const total = 30;

            // Assert
            expect(ChineseBlackjackUtils.isFiveCards(cards, total)).toBe(false);
        });

        test("should return false for total <= 21 and less than 5 cards", () => {
            //Arrange
            const cards = [
                { rank: "10", suit: 1 },
                { rank: "J", suit: 1 }
            ];
            const total = 20;

            // Assert
            expect(ChineseBlackjackUtils.isFiveCards(cards, total)).toBe(false);
        });
    });

    describe("isUnqualified", () => {
        test("should return true for total < 16 and not 5 cards", () => {
            const cards = [
                { rank: "2", suit: 1 },
                { rank: "3", suit: 1 }
            ];
            const total = 15;
            expect(ChineseBlackjackUtils.isUnqualified(cards, total)).toBe(true);
        });

        test("should return false for total >= 16 and not 5 cards", () => {
            const cards = [
                { rank: "10", suit: 1 },
                { rank: "6", suit: 1 }
            ];
            const total = 16;
            expect(ChineseBlackjackUtils.isUnqualified(cards, total)).toBe(false);
        });

        test("should return false for total < 16 and 5 cards", () => {
            const cards = [
                { rank: "2", suit: 1 },
                { rank: "3", suit: 1 },
                { rank: "4", suit: 1 },
                { rank: "5", suit: 1 },
                { rank: "2", suit: 1 }
            ];
            const total = 16;
            expect(ChineseBlackjackUtils.isUnqualified(cards, total)).toBe(false);
        });

        test("should return false for total < 16 and double AA cards", () => {
            const cards = [
                { rank: "A", suit: 1 },
                { rank: "A", suit: 2 }
            ];
            const total = 2;
            expect(ChineseBlackjackUtils.isUnqualified(cards, total)).toBe(false);
        });

        test("should return false for total < 16 and  card A and card 10", () => {
            const cards = [
                { rank: "A", suit: 1 },
                { rank: "10", suit: 2 }
            ];
            const total = 11;
            expect(ChineseBlackjackUtils.isUnqualified(cards, total)).toBe(false);
        });
    });

    describe("ChineseBlackjackUtils.getTotal", () => {
        test("should calculate total without Ace", () => {
            //Arrange
            const cards = [{ rank: "2" }, { rank: "3" }, { rank: "4" }];
            const cardNum = 3;

            // Act
            const result = ChineseBlackjackUtils.getTotal(cards, cardNum);

            // Assert
            expect(result).toEqual([9]);
        });

        test("should calculate total with Ace and cardNum less than 4", () => {
            //Arrange
            const cards = [{ rank: "A" }, { rank: "8" }];
            const cardNum = 2;

            // Act
            const result = ChineseBlackjackUtils.getTotal(cards, cardNum);

            // Assert
            expect(result).toEqual([9, 19]);
        });

        test("should calculate total with Ace and cardNum equal to or greater than 4", () => {
            // Arrange
            const cards = [{ rank: "A" }, { rank: "8" }, { rank: "5" }, { rank: "2" }];
            const cardNum = 4;

            // Act
            const result = ChineseBlackjackUtils.getTotal(cards, cardNum);

            // Assert
            expect(result).toEqual([16]);
        });

        test("should handle case where total + 9 equals 21 with Ace", () => {
            // Arrange
            const cards = [{ rank: "A" }, { rank: "8" }, { rank: "2" }];
            const cardNum = 3;

            // Act
            const result = ChineseBlackjackUtils.getTotal(cards, cardNum);

            // Assert
            expect(result).toEqual([11, 21]);
        });

        test("should handle empty array of cards", () => {
            // Arrange
            const cards = [];
            const cardNum = 3;

            // Act
            const result = ChineseBlackjackUtils.getTotal(cards, cardNum);

            // Assert
            expect(result).toEqual([0]);
        });

        test("should calculate total with 5 cards without Ace => Five-Card", () => {
            // Arrange
            const cards = [{ rank: "2" }, { rank: "3" }, { rank: "4" }, { rank: "5" }, { rank: "6" }];
            const cardNum = 5;

            // Act
            const result = ChineseBlackjackUtils.getTotal(cards, cardNum);

            // Assert
            expect(result).toEqual([20]);
        });

        test("should calculate total with 5 cards with Ace and cardNum equal to or greater than 4 => bust", () => {
            // Arrange
            const cards = [{ rank: "A" }, { rank: "8" }, { rank: "5" }, { rank: "2" }, { rank: "10" }];
            const cardNum = 5;

            // Act
            const result = ChineseBlackjackUtils.getTotal(cards, cardNum);

            // Assert
            expect(result).toEqual([26]);
        });
    });
});
