import * as i18n from "i18n/runtime-scripts/LanguageData";

import EffectAppearanceLabel from "../../../../assets/common/EffectAppearanceLabel";
import MD5Tooltip from "../../../../assets/common/md5-tooltip/MD5Tooltip";
import MD5Component from "../../../../assets/games/_base/view-models/MD5Component";
import { mockFuntions } from "../../../mocks/TestUtils";

jest.mock("../../../../assets/common/GameUtils", () => ({
    default: class {
        public static createNodeFromPrefab() {
            return mockFuntions.createNodeFromPrefab();
        }
    }
}));

describe("Test class MD5Component", () => {
    let node: cc.Node;
    let md5Component: MD5Component;
    let md5Comp: any;

    beforeEach(() => {
        jest.useFakeTimers();
        node = new cc.Node();
        md5Component = node.addComponent(MD5Component);
        const md5Text = new cc.Node().addComponent(cc.Label);
        const copyButton = new cc.Node().addComponent(cc.Button);
        const md5Value = new EffectAppearanceLabel();
        md5Value.label = new cc.Node().addComponent(cc.Label);
        md5Value.mask = new cc.Mask();
        md5Value.mask.node = new cc.Node();

        md5Component.md5Text = md5Text;
        md5Component.copyButton = copyButton;
        md5Component.md5Value = md5Value;
        md5Component.md5TooltipContainer = new cc.Node();
        md5Component.hintCopyNode = new cc.Node();
        md5Component.md5ContentContainer = new cc.Node();

        md5Comp = md5Component as any;

        const temp: any = {};
        cc.tween = () => temp;
        cc.tween().to = (a, b, c?) => temp;
        cc.tween().start = () => temp;

        mockFuntions.createNodeFromPrefab = () => {
            const node = new cc.Node();
            MD5Tooltip.prototype.setData = jest.fn();
            node.addComponent(MD5Tooltip);
            return node;
        };
    });

    describe("Test method initMD5Tooltip", () => {
        it("Case 1: init initMD5Tooltip ", () => {
            // Act
            md5Component.initMD5Tooltip();
        });
    });

    describe("md5Component.resetMD5()", () => {
        it("Case 1: when has not timeout should not call global.clearTimeout", () => {
            // Arrange
            jest.spyOn(global, "clearTimeout");

            // Act
            md5Component.resetMd5();

            // Assert
            expect(global.clearTimeout).not.toHaveBeenCalledTimes(1);
        });

        it("Case 2: when has timeout should call global.clearTimeout", () => {
            // Arrange
            const data = {
                extraInfos: {},
                rawValue: "",
                hashValue: "a3958g78e8798g9s8d7g98989"
            };
            jest.spyOn(global, "clearTimeout");
            jest.spyOn(md5Component.node, "activeInHierarchy", "get").mockImplementationOnce(() => true);
            md5Component.updateMD5WithDelay(data);

            // Act
            md5Component.resetMd5();

            // Assert
            expect(global.clearTimeout).toHaveBeenCalledTimes(1);
        });
    });

    describe("Test method updateMD5WithDelay", () => {
        it("Case 1: not call setTimeOut when have hashValue", () => {
            // Arrange
            const data = {
                hashValue: "132354813esther147test"
            };
            jest.spyOn(global, "setTimeout");
            jest.spyOn(md5Component, "updateMD5Data");
            jest.spyOn(md5Component.node, "activeInHierarchy", "get").mockImplementationOnce(() => false);

            // Act
            md5Comp.updateMD5WithDelay(data);

            // Assert
            expect(md5Comp.updateMD5Data).toBeCalledTimes(1);
            expect(global.setTimeout).not.toBeCalledTimes(1);
        });

        it("Case 2: call setTimeOut when have hashValue", () => {
            // Arrange
            const data = {
                hashValue: "132354813esther147test"
            };
            jest.spyOn(global, "setTimeout");
            jest.spyOn(md5Comp.node, "activeInHierarchy", "get").mockImplementationOnce(() => true);

            // Act
            md5Comp.updateMD5WithDelay(data);

            // Assert
            expect(global.setTimeout).toBeCalledTimes(1);
            expect(global.setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1.35 * 1000);
        });
    });

    describe("Test method setCopyString", () => {
        it("Case 1: ", () => {
            // Arrange
            const text = "k409fdu3445kj9345930590";
            // Act
            md5Comp.setCopyString(text);

            // Assert
            expect(md5Comp.md5CopyString).toEqual(text);
        });
    });

    describe("Test method generateMD5Result", () => {
        it("Case 1: should call playAnimation ", () => {
            // Arrange
            const data = {
                hashValue: "132354813esther147234sf345343453fg455test"
            };
            jest.spyOn(md5Comp.md5Value, "playAnimation");
            // Act
            md5Comp.generateMD5Result(data);

            // Assert
            expect(md5Comp.md5Value.playAnimation).toBeCalled();
        });
    });

    describe("Test method setCaptionAndHintForMD5", () => {
        describe("return translate text", () => {
            it("Case 1: isMD5Key is true ", () => {
                // Arrange
                // Act
                md5Component.setCaptionAndHintForMD5(true);

                // Assert
                expect(md5Component.md5Text.string).toMatch(`${i18n.t("ui.md5.result")}`);
            });

            it("Case 1: isMD5Key is false ", () => {
                // Arrange
                // Act
                md5Component.setCaptionAndHintForMD5(false);

                // Assert
                expect(md5Component.md5Text.string).toMatch(`${i18n.t("ui.md5_string")}`);
            });
        });
    });

    describe("Test method updateMD5Data", () => {
        it("Case 1: updateMD5Data ", () => {
            // Arrange
            const data = {
                hashValue: "a",
                rawValue: "b",
                extraInfos: {}
            };
            jest.spyOn(md5Comp, "setCaptionAndHintForMD5");
            jest.spyOn(md5Comp, "generateMD5Result");
            jest.spyOn(md5Component, "setCopyString");
            Object.defineProperty(md5Component.node, "isValid", {
                get: () => true,
                configurable: true
            });
            // Act
            md5Component.updateMD5Data(data);

            // Assert
            expect(md5Component.setCaptionAndHintForMD5).toHaveBeenCalledWith(!!data.rawValue);
            expect(md5Component.generateMD5Result).toHaveBeenCalledWith(data);
            expect(md5Component.setCopyString).toHaveBeenCalledWith(data.hashValue || data.rawValue);
        });
    });
});
