import _ = require("lodash");

import CommonDialog from "../../../assets/common/_base/view-models/CommonDialog";
import RouletteStatistics from "../../../assets/games/_roulette-s/scripts/roulette-statistics";
import RouletteStatisticsTopNumbers from "../../../assets/games/_roulette-s/scripts/roulette-statistics-top-numbers";

describe("RouletteStatistics", () => {
    let node: cc.Node;
    let comp: RouletteStatistics;
    const data = [
        6, 30, 7, 8, 14, 7, 24, 14, 13, 12, 6, 29, 28, 22, 14, 33, 27, 11, 33, 20, 28, 14, 36, 35, 32, 3, 36, 13, 4, 30, 6, 30, 7, 14, 20,
        15, 19, 31, 23, 28, 7, 16, 31, 10, 16, 6, 30, 4, 9, 11, 9, 17, 6, 1, 17, 17, 7, 35, 35, 15, 17, 23, 19, 30, 19, 7, 28, 32, 14, 27,
        14, 15, 34, 14, 12, 8, 2, 36, 15, 26, 28, 19, 19, 9, 27, 23, 33, 33, 29, 32, 34, 22, 25, 29, 14, 11, 12, 10, 3, 8, 8, 3, 35, 4, 33,
        15, 9, 35, 3, 2, 15, 13, 4, 1, 14, 29, 24, 9, 7, 2, 17, 2, 6, 23, 33, 21, 36, 4, 1, 35, 11, 12, 25, 25, 22, 2, 21, 2, 20, 1, 31, 5,
        5, 22, 19, 7, 11, 1, 9, 29, 20, 5, 14, 14, 32, 11, 0, 13, 11, 28, 5, 28, 20, 22, 22, 30, 18, 9, 34, 9, 12, 10, 17, 24, 18, 29, 17,
        30, 30, 34, 18, 25, 12, 8, 35, 8, 10, 36, 7, 19, 29, 16, 8, 15, 1, 33, 31, 5, 25, 26, 0, 3, 10, 25, 15, 16, 7, 36, 36, 30, 9, 16,
        18, 32, 16, 34, 24, 32, 9, 26, 29, 21, 9, 0, 24, 29, 14, 24, 22, 24, 27, 30, 9, 14, 35, 3, 15, 9, 34, 9, 29, 26, 35, 8, 23, 33, 35,
        21, 3, 16, 20, 12, 12, 5, 9, 31, 34, 16, 16, 25, 16, 21, 17, 33, 31, 34, 30, 27, 8, 7, 35, 31, 36, 32, 9, 11, 15, 12, 6, 11, 24, 8,
        14, 13, 27, 10, 19, 35, 18, 15, 31, 24, 21, 22, 19, 8, 23, 1, 0, 22
    ];
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(RouletteStatistics);
        comp.mainFrame = new cc.Node();
        comp.mainFrame.addComponent(CommonDialog);
        
        // Setup hotNumbers component
        const hotNumbersNode = new cc.Node();
        comp.hotNumbers = hotNumbersNode.addComponent(RouletteStatisticsTopNumbers);
        comp.hotNumbers.numberZeroBg = new cc.SpriteFrame();
        comp.hotNumbers.numberRedBg = new cc.SpriteFrame();
        comp.hotNumbers.numberBlackBg = new cc.SpriteFrame();
        
        // Setup coldNumbers component
        const coldNumbersNode = new cc.Node();
        comp.coldNumbers = coldNumbersNode.addComponent(RouletteStatisticsTopNumbers);
        comp.coldNumbers.numberZeroBg = new cc.SpriteFrame();
        comp.coldNumbers.numberRedBg = new cc.SpriteFrame();
        comp.coldNumbers.numberBlackBg = new cc.SpriteFrame();
        
        // Setup percentage labels
        comp.percentageLabels = [
            new cc.Node().addComponent(cc.Label), // zeroPercent
            new cc.Node().addComponent(cc.Label), // dozen1Percent
            new cc.Node().addComponent(cc.Label), // dozen2Percent
            new cc.Node().addComponent(cc.Label)  // dozen3Percent
        ];
    });
    
    describe("onLoad", () => {
        it("should setup common dialog", () => {
            // Arrange
            const mockDestroy = jest.fn();
            comp.node.destroy = mockDestroy;
            
            // Act
            comp.onLoad();
            
            // Assert
            expect(comp.mainFrame.getComponent(CommonDialog)).toBeDefined();
        });
    });

    describe("generateStatistic", () => {
        beforeEach(() => {
            // Arrange
            comp.createResultStatistic = jest.fn();
            comp.handleStatsPercent = jest.fn();

            // Act
            comp.generateStatistic(data);
        });

        it("should assign data to result", () => {
            // Assert
            expect(comp.result).toEqual(data);
        });
        it("should call createResultStatistic", () => {
            // Assert
            expect(comp.createResultStatistic).toHaveBeenCalled();
        });
        it("should call handleStatsPercent", () => {
            // Assert
            expect(comp.handleStatsPercent).toHaveBeenCalled();
        });
    });

    describe("generateStatistic with empty data", () => {
        it("should return early when data is empty", () => {
            // Arrange
            comp.createResultStatistic = jest.fn();
            comp.handleStatsPercent = jest.fn();

            // Act
            comp.generateStatistic([]);

            // Assert
            expect(comp.createResultStatistic).not.toHaveBeenCalled();
            expect(comp.handleStatsPercent).not.toHaveBeenCalled();
        });
    });

    describe("createResultStatistic", () => {
        it("should create resultStats with correct structure", () => {
            // Arrange
            comp.result = [0, 1, 2, 0, 1];

            // Act
            comp.createResultStatistic();

            // Assert
            expect(comp.resultStats).toHaveLength(37);
            
            // Find specific numbers by their number property, not by index after sorting
            const number0 = comp.resultStats.find(item => item.number === 0);
            const number1 = comp.resultStats.find(item => item.number === 1);
            const number2 = comp.resultStats.find(item => item.number === 2);
            const number3 = comp.resultStats.find(item => item.number === 3);
            
            expect(number0.times).toBe(2); // number 0 appears 2 times
            expect(number1.times).toBe(2); // number 1 appears 2 times
            expect(number2.times).toBe(1); // number 2 appears 1 time
            expect(number3.times).toBe(0); // number 3 appears 0 times
        });

        it("should sort resultStats by times", () => {
            // Arrange
            comp.result = [0, 1, 2, 0, 1];

            // Act
            comp.createResultStatistic();

            // Assert
            expect(comp.resultStats[0].times).toBeLessThanOrEqual(comp.resultStats[1].times);
            expect(comp.resultStats[1].times).toBeLessThanOrEqual(comp.resultStats[2].times);
        });
    });

    describe("handleStatsPercent", () => {
        beforeEach(() => {
            // arrange
            comp.updateHotColdNumbers = jest.fn();
            comp["calculateBasicStatic"] = jest.fn();
            comp["calculateDozensStatic"] = jest.fn();
        });
        describe("when result has data", () => {
            beforeEach(() => {
                // arrange
                comp.result = data;

                // Act
                comp.handleStatsPercent();
            });
            it("should call updateHotColdNumbers", () => {
                // Assert
                expect(comp.updateHotColdNumbers).toBeCalledWith();
            });

            it("should call calculateBasicStatic", () => {
                // Assert
                expect(comp["calculateBasicStatic"]).toBeCalledWith();
            });

            it("should call calculateDozensStatic", () => {
                // Assert
                expect(comp["calculateDozensStatic"]).toBeCalledWith();
            });
        });
    });

    describe("updateHotColdNumbers", () => {
        it("should call setData on hotNumbers and coldNumbers", () => {
            // Arrange
            comp.hotNumbers.setData = jest.fn();
            comp.coldNumbers.setData = jest.fn();
            comp.resultStats = [
                { number: 0, times: 1 },
                { number: 1, times: 2 },
                { number: 2, times: 3 },
                { number: 3, times: 4 },
                { number: 4, times: 5 },
                { number: 5, times: 6 },
                { number: 6, times: 7 },
                { number: 7, times: 8 }
            ];

            // Act
            comp.updateHotColdNumbers();

            // Assert
            // After sorting, cold numbers (lowest times) should be first 4 elements
            expect(comp.coldNumbers.setData).toHaveBeenCalledWith([
                { number: 0, times: 1 },
                { number: 1, times: 2 },
                { number: 2, times: 3 },
                { number: 3, times: 4 }
            ]);
            
            // Hot numbers (highest times) should be last 4 elements
            expect(comp.hotNumbers.setData).toHaveBeenCalledWith([
                { number: 4, times: 5 },
                { number: 5, times: 6 },
                { number: 6, times: 7 },
                { number: 7, times: 8 }
            ]);
        });
    });

    describe("calculateBasicStatic", () => {
        it("should calculate red/black percentages correctly", () => {
            // Arrange
            comp.result = [1, 2, 3, 4, 5]; // 1,3,5 are red, 2,4 are black
            const mockItem1 = {
                setData: jest.fn(),
                updateProgressBar: jest.fn()
            };
            const mockItem2 = {
                setData: jest.fn(),
                updateProgressBar: jest.fn()
            };
            comp.getComponentsInChildren = jest.fn().mockReturnValue([mockItem1, mockItem2]);

            // Act
            comp["calculateBasicStatic"]();

            // Assert
            // Logic: red = 60% (3/5), black = 100 - red = 40%
            expect(mockItem1.setData).toHaveBeenCalledWith(60, 40);
            expect(mockItem1.updateProgressBar).toHaveBeenCalledWith(3, 2);
        });

        it("should calculate odd/even percentages correctly", () => {
            // Arrange
            comp.result = [1, 2, 3, 4, 5]; // 1,3,5 are odd, 2,4 are even
            const mockItem1 = {
                setData: jest.fn(),
                updateProgressBar: jest.fn()
            };
            const mockItem2 = {
                setData: jest.fn(),
                updateProgressBar: jest.fn()
            };
            comp.getComponentsInChildren = jest.fn().mockReturnValue([mockItem1, mockItem2]);

            // Act
            comp["calculateBasicStatic"]();

            // Assert
            // Logic: odd = 60% (3/5), even = 100 - odd = 40%
            expect(mockItem2.setData).toHaveBeenCalledWith(60, 40);
            expect(mockItem2.updateProgressBar).toHaveBeenCalledWith(3, 2);
        });

        it("should handle zero values correctly", () => {
            // Arrange
            comp.result = [0, 0, 1, 2]; // 2 zeros, 1 red, 1 black
            const mockItem1 = {
                setData: jest.fn(),
                updateProgressBar: jest.fn()
            };
            const mockItem2 = {
                setData: jest.fn(),
                updateProgressBar: jest.fn()
            };
            comp.getComponentsInChildren = jest.fn().mockReturnValue([mockItem1, mockItem2]);

            // Act
            comp["calculateBasicStatic"]();

            // Assert
            // Logic: red = 50% (1/2), black = 100 - red = 50%
            expect(mockItem1.setData).toHaveBeenCalledWith(50, 50);
            expect(mockItem1.updateProgressBar).toHaveBeenCalledWith(1, 1);
        });

        it("should handle all zeros correctly", () => {
            // Arrange
            comp.result = [0, 0, 0]; // All zeros
            const mockItem1 = {
                setData: jest.fn(),
                updateProgressBar: jest.fn()
            };
            const mockItem2 = {
                setData: jest.fn(),
                updateProgressBar: jest.fn()
            };
            comp.getComponentsInChildren = jest.fn().mockReturnValue([mockItem1, mockItem2]);

            // Act
            comp["calculateBasicStatic"]();

            // Assert
            // Logic: when totalNonZero = 0, red = 0, black = 0
            expect(mockItem1.setData).toHaveBeenCalledWith(0, 0);
            expect(mockItem1.updateProgressBar).toHaveBeenCalledWith(0, 0);
        });
    });

    describe("calculateDozensStatic", () => {
        it("should display percent for zero, dozen1, dozen2 and dozen3", () => {
            // Arrange
            comp.result = [0, 1, 12, 13, 24, 25, 36]; // 1 zero, 2 dozen1, 2 dozen2, 2 dozen3
            const zeroPercent = _.round((1 / 7) * 100); // 14%
            const dozen1 = _.round((2 / 7) * 100); // 29%
            const dozen2 = _.round((2 / 7) * 100); // 29%
            const dozen3 = 100 - (zeroPercent + dozen1 + dozen2); // 28%

            // Act
            comp["calculateDozensStatic"]();

            // Assert
            expect(comp.percentageLabels[0].string).toMatch(`${zeroPercent}%`);
            expect(comp.percentageLabels[1].string).toMatch(`${dozen1}%`);
            expect(comp.percentageLabels[2].string).toMatch(`${dozen2}%`);
            expect(comp.percentageLabels[3].string).toMatch(`${dozen3}%`);
        });
    });
});
