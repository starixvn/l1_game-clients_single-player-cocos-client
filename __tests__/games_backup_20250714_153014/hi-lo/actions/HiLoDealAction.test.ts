import AudioManager from "../../../../assets/common/audio/AudioManager";
import { numberWithCommas } from "../../../../assets/common/helpers/NumberHelper";
import { handleStatusLost, handleStatusWon, updateCard, updateStakesAndButtons, updateStatistic } from "../../../../assets/games/hi-lo/actions/HiLoDealAction";
import { HiLoOwnBetsModel } from "../../../../assets/games/hi-lo/events-models/HiLoOwnBetsModel";
import { HiLoStateModel } from "../../../../assets/games/hi-lo/events-models/HiLoStateModel";
import { HiLoStatusModel } from "../../../../assets/games/hi-lo/events-models/HiLoStatusModel";
import HiLo from "../../../../assets/games/hi-lo/view-models/HiLo";
import HiLoBettingArea from "../../../../assets/games/hi-lo/view-models/HiLoBettingArea";

jest.mock("../../../../assets/common/audio/AudioManager", () => jest.requireActual("../../../mocks/MockedAudioManager"));

jest.mock("../../../../assets/games/hi-lo/view-models/HiLo", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            resetUIBlankNewState: jest.fn(),
            showProcessingWarning: jest.fn(),
            showPlayGameButton: jest.fn(),
            updateUserBalance: jest.fn(),
            resetUIPrepareNewRound: jest.fn(),
            showWinningBet: jest.fn().mockResolvedValue((value: number) => {}),
            showUserLoseMessage: jest.fn().mockResolvedValue((value: number) => {}),
            enableCollectButton: jest.fn(),

            statisticComp: {
                updateCards: jest.fn()
            },

            betBoardComp: {
                setCurrentBet: jest.fn(),
                disableBetBoard: jest.fn()
            },
            resultComp: {
                updateResult: jest.fn(),
                spin: jest.fn()
            },
            betWin: new cc.Node().addComponent(cc.Label),

            currentBet: 1,
            spinCardsEffectDuration: 1,
            config: { betTime: 1 },
            isStopSchedule: false,

            gameData: {
                stateModel: new HiLoStateModel()
            },
            collectAudioClip: {}
        };
    })
}));

jest.mock("../../../../assets/games/hi-lo/events-models/HiLoStateModel", () => {
    return {
        HiLoStateModel: () => ({
            state: 0,
            prepareNewRound: jest.fn()
        })
    };
});

jest.mock("../../../../assets/games/hi-lo/view-models/HiLoBettingArea", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            enableBetChoice: jest.fn(),
            updateStakeAmount: jest.fn(),
            resetStakeAmount: jest.fn()
        };
    })
}));

jest.mock("../../../../assets/games/hi-lo/events-models/HiLoStatusModel", () => ({
    HiLoStatusModel: () => ({
        isSettled: false,
        win: false,
        reset: jest.fn()
    })
}));

describe("HiLoDealAction", () => {
    let mainGame: HiLo;
    let ownBetsModel: HiLoOwnBetsModel;
    let statusModel: HiLoStatusModel;
    let playSFX: any;
    let bettingAreaComp: HiLoBettingArea;

    beforeEach(() => {
        mainGame = new HiLo();
        ownBetsModel = new HiLoOwnBetsModel();
    });

    describe("handleStatusWon", () => {
        beforeEach(() => {
            // Arrange
            statusModel = new HiLoStatusModel();
            playSFX = jest.spyOn(AudioManager.getInstance(), "playSFX");
        });

        it("should call playSFX", () => {
            // Act
            handleStatusWon(mainGame)(statusModel);
            // Assert
            expect(playSFX).toBeCalledWith(mainGame.collectAudioClip);
        });

        it("should call updateUserBalance", () => {
            // Act
            handleStatusWon(mainGame)(statusModel);
            // Assert
            expect(mainGame.updateUserBalance).toHaveBeenCalledTimes(1);
        });
        it("should call resetUIPrepareNewRound", () => {
            // Act
            handleStatusWon(mainGame)(statusModel);

            // Assert
            expect(mainGame.resetUIPrepareNewRound).toBeCalledTimes(1);
        });
        it("should call showWinningBet", () => {
            // Act
            handleStatusWon(mainGame)(statusModel);

            // Assert
            expect(mainGame.showWinningBet).toBeCalledTimes(1);
        });
        it("should not call prepareNewRound from mainGame.gameData.stateModel immediately", () => {
            // Act
            handleStatusWon(mainGame)(statusModel);

            // Assert
            expect(mainGame.gameData.stateModel.prepareNewRound).not.toBeCalled();
        });

        it("should call prepareNewRound from mainGame.gameData.stateModel after showWinningBet ", async () => {
            // Arrange
            mainGame = new HiLo();

            // Act
            await handleStatusWon(mainGame)(statusModel);

            // Assert
            expect(mainGame.gameData.stateModel.prepareNewRound).toHaveBeenCalledTimes(1);
        });
    });

    describe("handleStatusLost", () => {
        beforeEach(() => {
            // Arrange
            statusModel = new HiLoStatusModel();
        });

        it("should do nothing when isSettled false", () => {
            // Arrange
            statusModel.isSettled = false;

            // Act
            handleStatusLost(mainGame)(statusModel);

            // Assert
            expect(mainGame.showUserLoseMessage).not.toBeCalled();
        });

        it("should do nothing when win true", () => {
            // Arrange
            statusModel.win = true;

            // Act
            handleStatusLost(mainGame)(statusModel);

            // Assert
            expect(mainGame.showUserLoseMessage).not.toBeCalled();
        });

        it("should do nothing when shouldHandleStatus false", () => {
            // Arrange
            mainGame.shouldHandleStatus = false;

            // Act
            handleStatusLost(mainGame)(statusModel);

            // Assert
            expect(mainGame.showUserLoseMessage).not.toBeCalled();
        });

        it("should call showUserLoseMessage when win false, isSettled true and shouldHandleStatus true", () => {
            // Arrange
            statusModel.isSettled = true;
            statusModel.win = false;
            mainGame = new HiLo();
            mainGame.shouldHandleStatus = true;

            // Act
            handleStatusLost(mainGame)(statusModel);

            // Assert
            expect(mainGame.showUserLoseMessage).toBeCalledTimes(1);
            expect(mainGame.shouldHandleStatus).toEqual(false);
        });

        it("should not call mainGame.gameData.stateModel.prepareNewRound immediately when win false, isSettled true and shouldHandleStatus true", () => {
            // Arrange
            statusModel.isSettled = true;
            statusModel.win = false;
            mainGame = new HiLo();
            mainGame.shouldHandleStatus = true;

            // Act
            handleStatusLost(mainGame)(statusModel);

            // Assert
            expect(mainGame.gameData.stateModel.prepareNewRound).not.toBeCalled();
            expect(statusModel.reset).not.toBeCalled();
            expect(mainGame.shouldHandleStatus).toEqual(false);
        });

        it("should call mainGame.gameData.stateModel.prepareNewRound after showUserLoseMessage when win false, isSettled true", async () => {
            // Arrange
            statusModel.isSettled = true;
            statusModel.win = false;
            mainGame = new HiLo();
            mainGame.shouldHandleStatus = true;

            // Act
            await handleStatusLost(mainGame)(statusModel);

            // Assert
            expect(mainGame.gameData.stateModel.prepareNewRound).toBeCalledTimes(1);
            expect(statusModel.reset).toBeCalledTimes(1);
            expect(mainGame.shouldHandleStatus).toEqual(false);
        });
    });

    describe("updateCard", () => {
        beforeEach(() => {
            // Act
            updateCard(mainGame)(ownBetsModel);
        });
        it("should call resultComp updateResult", () => {
            // Assert
            expect(mainGame.resultComp.updateResult).toBeCalledWith(ownBetsModel.result);
        });
        it("should call resultComp spin", () => {
            // Assert
            expect(mainGame.resultComp.spin).toBeCalledWith(
                mainGame.spinCardsEffectDuration,
                ownBetsModel.remainingTime > mainGame.config.betTime
            );
        });
    });

    describe("updateStatistic", () => {
        it("should call statisticComp updateCards", () => {
            // Act
            updateStatistic(mainGame)(ownBetsModel);
            // Assert
            expect(mainGame.statisticComp.updateCards).toBeCalledWith(ownBetsModel.result);
        });
    });

    describe("updateStakesAndButtons", () => {
        beforeEach(() => {
            // Arrange
            bettingAreaComp = new HiLoBettingArea();
            mainGame.bettingAreas = [bettingAreaComp, bettingAreaComp];
            ownBetsModel.result = [
                { suit: 1, rank: "4" },
                { suit: 0, rank: "8" }
            ];
            ownBetsModel.betwin = 8;
            ownBetsModel.totalTurns = 1;
        });

        it("should call enableBetChoice and enableCollectButton", () => {
            // Arrange
            ownBetsModel.nextAmounts = { h: 12, l: 10 };
            const enableBetChoiceSpy = jest.spyOn(bettingAreaComp, "enableBetChoice");
            const enableCollectButtonSpy = jest.spyOn(mainGame, "enableCollectButton");

            // Act
            updateStakesAndButtons(mainGame)(ownBetsModel);

            // Assert
            expect(enableBetChoiceSpy).toBeCalledTimes(2);
            expect(enableCollectButtonSpy).toBeCalledTimes(1);
        });

        it("should set betWin", () => {
            // Arrange
            ownBetsModel.nextAmounts = { h: 12, l: 10 };

            // Act
            updateStakesAndButtons(mainGame)(ownBetsModel);

            // Assert
            expect(mainGame.betWin.string).toMatch(numberWithCommas(ownBetsModel.betwin, 2));
        });

        describe("when nextAmounts has value and rank is neither A nor 2", () => {
            it("should call updateStakeAmount", () => {
                // Arrange
                ownBetsModel.nextAmounts = { h: 12, l: 10 };
                const updateStakeAmountSpy = jest.spyOn(bettingAreaComp, "updateStakeAmount");

                // Act
                updateStakesAndButtons(mainGame)(ownBetsModel);

                // Assert
                expect(updateStakeAmountSpy).toBeCalledTimes(2);
            });
        });

        it("should not call updateStake if nextAmounts is null", () => {
            // Arrange
            ownBetsModel.nextAmounts = null;
            const updateStakeAmountSpy = jest.spyOn(bettingAreaComp, "updateStakeAmount");

            // Act
            updateStakesAndButtons(mainGame)(ownBetsModel);

            // Assert
            expect(updateStakeAmountSpy).not.toBeCalled();
        });
    });
});
