import RouletteBetItem from "../../../assets/games/_roulette-s/scripts/new-result-number";
import { CustomColor } from "../../../assets/games/_roulette-s/scripts/roulette-s-utils";

describe("Test class RouletteBetItem", () => {
    let node: cc.Node;
    let comp: RouletteBetItem;
    let anyComp: any;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(RouletteBetItem);
        anyComp = comp as any;
        comp.background = new cc.Node().addComponent(cc.Sprite);
        comp.label = new cc.Node().addComponent(cc.Label);
        comp.leftNode = new cc.Node();
        comp.rightNode = new cc.Node();
        comp.leftLabel = new cc.Node().addComponent(cc.Label);
        comp.rightLabel = new cc.Node().addComponent(cc.Label);
    });
    
    describe("Test method setNumber", () => {
        it("Case 1: number = 0", () => {
            // Arrange
            const number = 0;
            const showSpy = jest.spyOn(anyComp, "show");
            const color = cc.Color.BLACK;

            // Act
            comp.setNumber(number);

            // Assert
            expect(comp.label.string).toMatch(number.toString());
            expect(comp.background.node.color).toEqual(color.fromHEX(CustomColor.green));
            expect(showSpy).toBeCalledWith();
            
            // Test neighbor numbers for 0
            expect(comp.leftLabel.string).toMatch("26"); // left neighbor of 0
            expect(comp.rightLabel.string).toMatch("32"); // right neighbor of 0
            expect(comp.leftNode.color).toEqual(color.fromHEX(CustomColor.black)); // 26 is black
            expect(comp.rightNode.color).toEqual(color.fromHEX(CustomColor.red)); // 32 is black
        });

        it("Case 2: number is in red numbers list", () => {
            // Arrange
            const number = 3; // 3 is red
            const showSpy = jest.spyOn(anyComp, "show");
            const color = cc.Color.BLACK;

            // Act
            comp.setNumber(number);

            // Assert
            expect(comp.label.string).toMatch(number.toString());
            expect(comp.background.node.color).toEqual(color.fromHEX(CustomColor.red));
            expect(showSpy).toBeCalledWith();
            
            // Test neighbor numbers for 3
            expect(comp.leftLabel.string).toMatch("35"); // left neighbor of 3
            expect(comp.rightLabel.string).toMatch("26"); // right neighbor of 3
        });

        it("Case 3: number is not in red numbers list", () => {
            // Arrange
            const number = 4; // 4 is black
            const showSpy = jest.spyOn(anyComp, "show");
            const color = cc.Color.BLACK;

            // Act
            comp.setNumber(number);

            // Assert
            expect(comp.label.string).toMatch(number.toString());
            expect(comp.background.node.color).toEqual(color.fromHEX(CustomColor.black));
            expect(showSpy).toBeCalledWith();
            
            // Test neighbor numbers for 4
            expect(comp.leftLabel.string).toMatch("19"); // left neighbor of 4
            expect(comp.rightLabel.string).toMatch("21"); // right neighbor of 4
        });

        it("Case 4: number at the end of the list (26)", () => {
            // Arrange
            const number = 26; // Last number in the list
            const showSpy = jest.spyOn(anyComp, "show");
            const color = cc.Color.BLACK;

            // Act
            comp.setNumber(number);

            // Assert
            expect(comp.label.string).toMatch(number.toString());
            expect(showSpy).toBeCalledWith();
            
            // Test neighbor numbers for 26 (wrapping around)
            expect(comp.leftLabel.string).toMatch("3"); // left neighbor of 26
            expect(comp.rightLabel.string).toMatch("0"); // right neighbor of 26 (wraps to 0)
        });

        it("Case 5: number not in the list", () => {
            // Arrange
            const number = 99; // Number not in the roulette list
            const showSpy = jest.spyOn(anyComp, "show");
            const color = cc.Color.BLACK;

            // Act
            comp.setNumber(number);

            // Assert
            expect(comp.label.string).toMatch(number.toString());
            expect(showSpy).toBeCalledWith();
            
            // Test neighbor numbers for invalid number
            expect(comp.leftLabel.string).toMatch("0"); // Default to 0
            expect(comp.rightLabel.string).toMatch("0"); // Default to 0
        });
    });

    describe("Test method getNeighbourNumber", () => {
        it("should return correct neighbors for middle number", () => {
            // Arrange
            const number = 15; // Middle of the list

            // Act
            const result = comp.getNeighbourNumber(number);

            // Assert
            expect(result.left).toBe(32); // Left neighbor of 15
            expect(result.right).toBe(19); // Right neighbor of 15
        });

        it("should return correct neighbors for first number", () => {
            // Arrange
            const number = 0; // First number in the list

            // Act
            const result = comp.getNeighbourNumber(number);

            // Assert
            expect(result.left).toBe(26); // Left neighbor of 0 (wraps to end)
            expect(result.right).toBe(32); // Right neighbor of 0
        });

        it("should return correct neighbors for last number", () => {
            // Arrange
            const number = 26; // Last number in the list

            // Act
            const result = comp.getNeighbourNumber(number);

            // Assert
            expect(result.left).toBe(3); // Left neighbor of 26
            expect(result.right).toBe(0); // Right neighbor of 26 (wraps to start)
        });

        it("should return 0,0 for invalid number", () => {
            // Arrange
            const number = 99; // Invalid number

            // Act
            const result = comp.getNeighbourNumber(number);

            // Assert
            expect(result.left).toBe(0);
            expect(result.right).toBe(0);
        });
    });

    describe("Test method show", () => {
        it("should set node active to true", () => {
            // Arrange

            // Act
            comp.show();

            // Assert
            expect(comp.node.active).toEqual(true);
        });
    });

    describe("Test method hide", () => {
        it("should set node active to false", () => {
            // Arrange

            // Act
            comp.hide();

            // Assert
            expect(comp.node.active).toEqual(false);
        });
    });
});
