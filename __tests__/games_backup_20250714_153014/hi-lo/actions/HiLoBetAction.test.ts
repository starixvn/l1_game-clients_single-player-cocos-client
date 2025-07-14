import { handleGameState } from "../../../../assets/games/hi-lo/actions/HiLoBetAction";
import { HiLoState } from "../../../../assets/games/hi-lo/events-models/HiLoState";
import { HiLoStateModel } from "../../../../assets/games/hi-lo/events-models/HiLoStateModel";
import HiLo from "../../../../assets/games/hi-lo/view-models/HiLo";

jest.mock("../../../../assets/games/hi-lo/view-models/HiLo", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            resetUIBlankNewState: jest.fn(),
            showProcessingWarning: jest.fn(),
            showPlayGameButton: jest.fn(),

            stakesComp: {
                resetStakes: jest.fn()
            },

            betBoardComp: {
                setCurrentBet: jest.fn(),
                disableBetBoard: jest.fn(),
                setNeedResetCurrentChip: jest.fn()
            },
            currentBet: 1,
            isStopSchedule: false
        };
    })
}));

jest.mock("../../../../assets/games/hi-lo/events-models/HiLoStateModel", () => {
    return {
        HiLoStateModel: () => ({
            state: 0
        })
    };
});

describe("HiLoBetAction", () => {
    let mainGame: HiLo;
    let stateModel: HiLoStateModel;
    beforeEach(() => {
        mainGame = new HiLo();
        stateModel = new HiLoStateModel();
    });

    describe("handleGameState", () => {
        describe("HiLoState.BLANK_NEW", () => {
            beforeEach(() => {
                // Arrange
                stateModel.state = HiLoState.BLANK_NEW;

                // Act
                handleGameState(mainGame)(stateModel);
            });

            it("should call showProcessingWarning false", () => {
                // Assert
                expect(mainGame.showProcessingWarning).toBeCalledWith(false);
            });
            it("should call resetUIBlankNewState", () => {
                // Assert
                expect(mainGame.resetUIBlankNewState).toBeCalledTimes(1);
            });
        });

        describe("HiLoState.IN_TURN", () => {
            beforeEach(() => {
                // Arrange
                stateModel.state = HiLoState.IN_TURN;

                // Act
                handleGameState(mainGame)(stateModel);
            });

            it("should call showProcessingWarning false", () => {
                // Assert
                expect(mainGame.showProcessingWarning).toBeCalledWith(false);
            });
            it("should call showPlayGameButton false", () => {
                // Assert
                expect(mainGame.showPlayGameButton).toBeCalledWith(false);
            });
            it("should call betBoardComp disableBetBoard true", () => {
                // Assert
                expect(mainGame.betBoardComp.disableBetBoard).toBeCalledWith(true);
            });
            it("should set isStopSchedule false", () => {
                // Assert
                expect(mainGame.isStopSchedule).toEqual(false);
            });
        });

        describe("HiLoState.SETTLED", () => {
            beforeEach(() => {
                // Arrange
                stateModel.state = HiLoState.SETTLED;

                // Act
                handleGameState(mainGame)(stateModel);
            });

            it("should call showProcessingWarning false", () => {
                // Assert
                expect(mainGame.showProcessingWarning).toBeCalledWith(false);
            });
            it("should call showPlayGameButton false", () => {
                // Assert
                expect(mainGame.showPlayGameButton).toBeCalledWith(false);
            });
            it("should call betBoardComp disableBetBoard true", () => {
                // Assert
                expect(mainGame.betBoardComp.disableBetBoard).toBeCalledWith(true);
            });
        });
    });
});
