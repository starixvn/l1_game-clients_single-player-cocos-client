import { updateClockTime } from "../../../../assets/games/hi-lo/actions/HiLoCountdownTimerAction";
import HiLo from "../../../../assets/games/hi-lo/view-models/HiLo";

jest.mock("../../../../assets/games/hi-lo/view-models/HiLo", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            animatedTime: {
                setTime: jest.fn(),
                node: new cc.Node()
            },
            config: {
                betTime: 16
            }
        };
    })
}));

describe("HiLoCountdownTimerAction", () => {
    let mainGame: HiLo;
    beforeEach(() => {
        mainGame = new HiLo();
    });
    describe("updateClockTime", () => {
        let remaining: number;
        beforeEach(() => {
            // Arrange
            mainGame.animatedTime.setTime = jest.fn();
        });

        describe("when clock is not active", () => {
            it("should active clock", () => {
                // Arrange
                remaining = 14;
                mainGame.animatedTime.node.active = false;

                // Act
                updateClockTime(mainGame)({ remaining });

                // Assert
                expect(mainGame.animatedTime.node.active).toBeTruthy();
            });
        });

        describe("when clock is active", () => {
            it("should keep clock active", () => {
                // Arrange
                remaining = 14;
                mainGame.animatedTime.node.active = true;

                // Act
                updateClockTime(mainGame)({ remaining });

                // Assert
                expect(mainGame.animatedTime.node.active).toBeTruthy();
            });
        });

        describe("when remaining < bettime", () => {
            it("should call clock.setTime", () => {
                // Arrange
                remaining = 14;

                // Act
                updateClockTime(mainGame)({ remaining });

                // Assert
                expect(mainGame.animatedTime.setTime).toBeCalledWith("14");
            });
        });

        describe("when remaining = bettime", () => {
            it("should call clock.setTime", () => {
                // Arrange
                remaining = 16;

                // Act
                updateClockTime(mainGame)({ remaining });

                // Assert
                expect(mainGame.animatedTime.setTime).toBeCalledWith("16");
            });
        });
        describe("when remaining > bettime", () => {
            it("should call clock.setTime", () => {
                // Arrange
                remaining = 17;

                // Act
                updateClockTime(mainGame)({ remaining });

                // Assert
                expect(mainGame.animatedTime.setTime).not.toBeCalled();
            });
        });
    });
});
