import LineView from "../../../assets/games/_slotgame_base/LineView";
import SlotBoard from "../../../assets/games/_slotgame_base/SlotBoard";

describe("LineView", () => {
    let node: cc.Node;
    let comp: LineView;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(LineView);
        comp.label = new cc.Node();
        comp.board = new cc.Node().addComponent(SlotBoard);
        comp.light = new cc.Node();
    });

    describe("playLightAnimation", () => {
        describe("Test method active", () => {
            it("case 1", () => {
                // Arrange
                jest.spyOn(comp, "runLightOnLine");

                // Act
                comp.playLightAnimation();

                // Assert
                expect(comp.runLightOnLine).toBeCalledWith(0);
            });
        });
    });
});
