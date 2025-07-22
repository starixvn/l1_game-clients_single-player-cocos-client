import DropdownItem, { IDropdownItem } from "../../../assets/games/_roulette-s/scripts/bet-history/dropdown-item";

describe("Test class DropdownItem", () => {
    let node: cc.Node;
    let comp: DropdownItem;
    let mockLabel: cc.Label;
    let mockBackground: cc.Node;

    beforeEach(() => {
        // Create mock nodes and components
        node = new cc.Node();
        comp = node.addComponent(DropdownItem);
        
        mockLabel = new cc.Node().addComponent(cc.Label);
        mockBackground = new cc.Node();

        // Assign properties
        comp.label = mockLabel;
        comp.background = mockBackground;
    });

    describe("Test method setData", () => {
        it("should set label text and value correctly", () => {
            // Arrange
            const testItem: IDropdownItem = {
                value: "test-value",
                text: "Test Item Text"
            };

            // Act
            comp.setData(testItem);

            // Assert
            expect(comp.label.string).toBe("Test Item Text");
            expect(comp.value).toBe("test-value");
        });

        it("should set background to inactive by default", () => {
            // Arrange
            const testItem: IDropdownItem = {
                value: "test-value",
                text: "Test Item Text"
            };

            // Act
            comp.setData(testItem);

            // Assert
            expect(comp.background.active).toBe(false);
        });

        it("should handle empty text and value", () => {
            // Arrange
            const testItem: IDropdownItem = {
                value: "",
                text: ""
            };

            // Act
            comp.setData(testItem);

            // Assert
            expect(comp.label.string).toBe("");
            expect(comp.value).toBe("");
            expect(comp.background.active).toBe(false);
        });

        it("should handle special characters in text", () => {
            // Arrange
            const testItem: IDropdownItem = {
                value: "special-value",
                text: "Test & Special @ Characters #123"
            };

            // Act
            comp.setData(testItem);

            // Assert
            expect(comp.label.string).toBe("Test & Special @ Characters #123");
            expect(comp.value).toBe("special-value");
        });
    });

    describe("Test method onSelect", () => {
        it("should call selectItem callback when defined", () => {
            // Arrange
            const mockSelectItem = jest.fn();
            comp.selectItem = mockSelectItem;

            // Act
            comp.onSelect();

            // Assert
            expect(mockSelectItem).toHaveBeenCalledTimes(1);
        });
    });

    describe("Test method setBackgroundActive", () => {
        it("should set background active to true", () => {
            // Act
            comp.setBackgroundActive(true);

            // Assert
            expect(comp.background.active).toBe(true);
        });

        it("should set background active to false", () => {
            // Arrange
            comp.background.active = true;

            // Act
            comp.setBackgroundActive(false);

            // Assert
            expect(comp.background.active).toBe(false);
        });
    });

    describe("Test default values", () => {
        it("should have correct default values", () => {
            // Assert
            expect(comp.value).toBeNull();
            expect(comp.selectItem).toBeNull();
        });
    });

    describe("Test property assignments", () => {
        it("should allow setting and getting value", () => {
            // Act
            comp.value = "new-value";

            // Assert
            expect(comp.value).toBe("new-value");
        });

        it("should allow setting and getting selectItem callback", () => {
            // Arrange
            const mockCallback = jest.fn();

            // Act
            comp.selectItem = mockCallback;

            // Assert
            expect(comp.selectItem).toBe(mockCallback);
        });
    });

    describe("Test integration scenarios", () => {
        it("should work correctly in a complete selection flow", () => {
            // Arrange
            const testItem: IDropdownItem = {
                value: "selected-value",
                text: "Selected Item"
            };
            const mockSelectItem = jest.fn();
            comp.selectItem = mockSelectItem;

            // Act - Set data
            comp.setData(testItem);
            
            // Assert - Data is set correctly
            expect(comp.label.string).toBe("Selected Item");
            expect(comp.value).toBe("selected-value");
            expect(comp.background.active).toBe(false);

            // Act - Set background active
            comp.setBackgroundActive(true);
            
            // Assert - Background is active
            expect(comp.background.active).toBe(true);

            // Act - Trigger selection
            comp.onSelect();
            
            // Assert - Callback was called
            expect(mockSelectItem).toHaveBeenCalledTimes(1);

            // Act - Set background inactive
            comp.setBackgroundActive(false);
            
            // Assert - Background is inactive
            expect(comp.background.active).toBe(false);
        });
    });
}); 