import Dropdown, { DropdownEvents } from "../../../assets/games/_roulette-s/scripts/bet-history/dropdown";
import DropdownItem, { IDropdownItem } from "../../../assets/games/_roulette-s/scripts/bet-history/dropdown-item";
import { getStringDate } from "../../../assets/common/helpers/DateTimeHelper";

// Mock i18n
jest.mock("i18n/runtime-scripts/LanguageData", () => ({
    t: jest.fn((key: string) => {
        if (key === "MiniRoulette.all") return "All";
        return key;
    })
}));

// Mock DateTimeHelper
jest.mock("../../../assets/common/helpers/DateTimeHelper", () => ({
    getStringDate: jest.fn((date: string) => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    })
}));

describe("Test class Dropdown", () => {
    let node: cc.Node;
    let comp: Dropdown;
    let mockScrollView: cc.Node;
    let mockContentNode: cc.Node;
    let mockSelectedLabel: cc.Label;
    let mockIconExpand: cc.Node;
    let mockItemPrefab: cc.Prefab;

    beforeEach(() => {
        // Create mock nodes and components
        node = new cc.Node();
        comp = node.addComponent(Dropdown);
        
        mockScrollView = new cc.Node();
        mockContentNode = new cc.Node();
        mockSelectedLabel = new cc.Node().addComponent(cc.Label);
        mockIconExpand = new cc.Node();
        mockItemPrefab = new cc.Prefab();

        // Assign properties
        comp.scrollView = mockScrollView;
        comp.contentNode = mockContentNode;
        comp.selectedLabel = mockSelectedLabel;
        comp.iconExpand = mockIconExpand;
        comp.itemPrefab = mockItemPrefab;

        // Mock cc.instantiate to return different instances each time
        cc.instantiate = jest.fn().mockImplementation(() => {
            const itemNode = new cc.Node();
            const dropdownItem = itemNode.addComponent(DropdownItem);
            dropdownItem.label = new cc.Node().addComponent(cc.Label);
            dropdownItem.background = new cc.Node();
            return itemNode;
        });
        
        // Mock tween
        cc.tween = jest.fn().mockReturnValue({
            to: jest.fn().mockReturnValue({
                start: jest.fn()
            })
        });
    });

    describe("Test method onLoad", () => {
        it("should initialize dropdown items correctly", () => {
            // Arrange
            const mockAddChild = jest.fn();
            mockContentNode.addChild = mockAddChild;

            // Act
            comp.onLoad();

            // Assert
            expect(cc.instantiate).toHaveBeenCalledTimes(8); // 7 days + 1 "All" option
            expect(mockAddChild).toHaveBeenCalledTimes(8);
            expect(mockScrollView.active).toBe(true);
            expect(mockScrollView.scaleY).toBe(0);
            expect(comp.dropdownItems).toHaveLength(8);
        });

        it("should set correct data for dropdown items", () => {
            // Arrange
            const mockAddChild = jest.fn();
            mockContentNode.addChild = mockAddChild;

            // Act
            comp.onLoad();

            // Assert
            // Index 0 should be "All" option (added by unshift)
            expect(comp.dropdownItems[0].value).toBe(""); // "All" option has empty value
            expect(comp.dropdownItems[0].label.string).toBe("All");
            
            // Index 1 should be today (0 days ago)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            expect(comp.dropdownItems[1].value).toBe(today.toString());
            
            // Index 7 should be 6 days ago
            const sixDaysAgo = new Date();
            sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
            sixDaysAgo.setHours(0, 0, 0, 0);
            expect(comp.dropdownItems[7].value).toBe(sixDaysAgo.toString());
        });

        it("should have unique values for each dropdown item", () => {
            // Arrange
            const mockAddChild = jest.fn();
            mockContentNode.addChild = mockAddChild;

            // Act
            comp.onLoad();

            // Assert
            expect(comp.dropdownItems).toHaveLength(8);
            
            // Check that each item has a unique value
            const values = comp.dropdownItems.map(item => item.value);
            const uniqueValues = new Set(values);
            expect(uniqueValues.size).toBe(8); // All values should be unique
            
            // Debug: log all values to see what's happening
            console.log("Dropdown item values:", values);
            console.log("Dropdown item labels:", comp.dropdownItems.map(item => item.label.string));
        });
    });

    describe("Test method initData", () => {
        it("should return correct data structure", () => {
            // Act
            const result = comp.initData();

            // Assert
            expect(result).toHaveLength(8); // 7 days + 1 "All" option
            expect(result[0]).toEqual({ value: "", text: "All" });
            
            // Check that other items have date values and formatted text
            for (let i = 1; i < result.length; i++) {
                expect(result[i].value).toBeDefined();
                expect(result[i].text).toBeDefined();
                expect(typeof result[i].value).toBe("string");
                expect(typeof result[i].text).toBe("string");
            }
        });

        it("should generate dates for last 7 days", () => {
            // Act
            const result = comp.initData();

            // Assert
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            for (let i = 1; i < result.length; i++) {
                const expectedDate = new Date(today);
                expectedDate.setDate(today.getDate() - (i - 1));
                const actualDate = new Date(result[i].value);
                
                expect(actualDate.getDate()).toBe(expectedDate.getDate());
                expect(actualDate.getMonth()).toBe(expectedDate.getMonth());
                expect(actualDate.getFullYear()).toBe(expectedDate.getFullYear());
            }
        });
    });

    describe("Test method getDateFromDaysAgo", () => {
        it("should return correct date for 0 days ago", () => {
            // Arrange
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Act
            const result = comp.getDateFromDaysAgo(0);

            // Assert
            const resultDate = new Date(result);
            expect(resultDate.getDate()).toBe(today.getDate());
            expect(resultDate.getMonth()).toBe(today.getMonth());
            expect(resultDate.getFullYear()).toBe(today.getFullYear());
        });

        it("should return correct date for 1 day ago", () => {
            // Arrange
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            // Act
            const result = comp.getDateFromDaysAgo(1);

            // Assert
            const resultDate = new Date(result);
            expect(resultDate.getDate()).toBe(yesterday.getDate());
            expect(resultDate.getMonth()).toBe(yesterday.getMonth());
            expect(resultDate.getFullYear()).toBe(yesterday.getFullYear());
        });

        it("should return correct date for 6 days ago", () => {
            // Arrange
            const sixDaysAgo = new Date();
            sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
            sixDaysAgo.setHours(0, 0, 0, 0);

            // Act
            const result = comp.getDateFromDaysAgo(6);

            // Assert
            const resultDate = new Date(result);
            expect(resultDate.getDate()).toBe(sixDaysAgo.getDate());
            expect(resultDate.getMonth()).toBe(sixDaysAgo.getMonth());
            expect(resultDate.getFullYear()).toBe(sixDaysAgo.getFullYear());
        });
    });

    describe("Test method onSelectItem", () => {
        it("should update selected item and emit event", () => {
            // Arrange
            const mockEmit = jest.fn();
            comp.node.emit = mockEmit;
            
            const testItem: IDropdownItem = { value: "test-value", text: "Test Text" };
            
            // Create some mock dropdown items
            comp.dropdownItems = [
                { setBackgroundActive: jest.fn(), value: "value1" } as any,
                { setBackgroundActive: jest.fn(), value: "test-value" } as any,
                { setBackgroundActive: jest.fn(), value: "value3" } as any
            ];

            // Act
            comp.onSelectItem(testItem);

            // Assert
            expect(comp.selectedItem).toBe(testItem);
            expect(comp.selectedLabel.string).toBe("Test Text");
            expect(comp.selectedValue).toBe("test-value");
            expect(mockEmit).toHaveBeenCalledWith(DropdownEvents.SELECT_ITEM, "test-value");
            
            // Check that background active states are set correctly
            comp.dropdownItems.forEach((item, index) => {
                if (index === 1) { // item with value "test-value"
                    expect(item.setBackgroundActive).toHaveBeenCalledWith(true);
                } else {
                    expect(item.setBackgroundActive).toHaveBeenCalledWith(false);
                }
            });
        });

        it("should call onExpand after selection", () => {
            // Arrange
            const mockOnExpand = jest.fn();
            comp.onExpand = mockOnExpand;
            
            const testItem: IDropdownItem = { value: "test-value", text: "Test Text" };
            comp.dropdownItems = [{ setBackgroundActive: jest.fn(), value: "test-value" } as any];

            // Act
            comp.onSelectItem(testItem);

            // Assert
            expect(mockOnExpand).toHaveBeenCalled();
        });
    });

    describe("Test method onExpand", () => {
        it("should expand dropdown when collapsed", () => {
            // Arrange
            comp.isExpand = false;
            const mockTween = {
                to: jest.fn().mockReturnValue({
                    start: jest.fn()
                })
            };
            cc.tween = jest.fn().mockReturnValue(mockTween);

            // Act
            comp.onExpand();

            // Assert
            expect(comp.isExpand).toBe(true);
            expect(mockIconExpand.scaleX).toBe(-1);
            expect(cc.tween).toHaveBeenCalledWith(mockScrollView);
            expect(mockTween.to).toHaveBeenCalledWith(0.1, { scaleY: 1 });
        });

        it("should collapse dropdown when expanded", () => {
            // Arrange
            comp.isExpand = true;
            const mockTween = {
                to: jest.fn().mockReturnValue({
                    start: jest.fn()
                })
            };
            cc.tween = jest.fn().mockReturnValue(mockTween);

            // Act
            comp.onExpand();

            // Assert
            expect(comp.isExpand).toBe(false);
            expect(mockIconExpand.scaleX).toBe(1);
            expect(cc.tween).toHaveBeenCalledWith(mockScrollView);
            expect(mockTween.to).toHaveBeenCalledWith(0.1, { scaleY: 0 });
        });
    });

    describe("Test default values", () => {
        it("should have correct default values", () => {
            // Assert
            expect(comp.selectedItem).toBeNull();
            expect(comp.selectedValue).toBe("");
            expect(comp.dropdownItems).toEqual([]);
            expect(comp.scrollViewHeight).toBe(291);
            expect(comp.isExpand).toBe(false);
        });
    });

    describe("Test dropdown item interaction", () => {
        it("should handle dropdown item selection correctly", () => {
            // Arrange
            const mockEmit = jest.fn();
            comp.node.emit = mockEmit;
            
            const testItem: IDropdownItem = { value: "2024-01-01", text: "01/01/2024" };
            
            // Create mock dropdown items with different values
            comp.dropdownItems = [
                { setBackgroundActive: jest.fn(), value: "value1" } as any,
                { setBackgroundActive: jest.fn(), value: "2024-01-01" } as any,
                { setBackgroundActive: jest.fn(), value: "value3" } as any
            ];

            // Act
            comp.onSelectItem(testItem);

            // Assert
            expect(comp.selectedValue).toBe("2024-01-01");
            expect(comp.selectedLabel.string).toBe("01/01/2024");
            expect(mockEmit).toHaveBeenCalledWith(DropdownEvents.SELECT_ITEM, "2024-01-01");
        });
    });
}); 