import * as urlHelper from "../../../assets/common/helpers/UrlHelper";
import configs = require("../../../assets/configs/Configs");
jest.mock("../../../assets/configs/GameConfigurations", () => ({
    getGameConfiguration: jest.fn().mockImplementation(() => {
        return {
            id: 12,
            key: "keno"
        };
    })
}));

describe("Test UrlHelper", () => {
    Object.defineProperty(window, "location", {
        value: { hostname: "www.unittest.com" },
        writable: true
    });
    Object.defineProperty(configs, "subGuideDomain", {
        value: "guides",
        writable: true
    });
    Object.defineProperty(configs, "subDomain", {
        value: "proxy",
        writable: true
    });
    Object.defineProperty(configs, "clientSubDomain", {
        value: "client",
        writable: true
    });
    Object.defineProperty(configs, "serverDomainMapper", {
        value: { "www.unittest.com": "unittest.com" },
        writable: true
    });
    describe("Test function getDomainFromHostName", () => {
        test.each`
            hostName              | expectedDomain
            ${"www.lumigame.com"} | ${"lumigame.com"}
            ${"www.sabagame.com"} | ${"sabagame.com"}
            ${"sabagame.com"}     | ${"sabagame.com"}
            ${"www.gamesaba.com"} | ${"gamesaba.com"}
            ${"gamesaba.com"}     | ${"gamesaba.com"}
            ${"www.v-gaming.net"} | ${"v-gaming.net"}
            ${"v-gaming.net"}     | ${"v-gaming.net"}
            ${"vgaming.win"}      | ${"vgaming.win"}
            ${"www.vgaming.win"}  | ${"vgaming.win"}
            ${"w2.vgaming.win"}   | ${"vgaming.win"}
        `("should return domain", ({ hostName, expectedDomain }) => {
            // Arrange
            const actual = urlHelper.extractDomainFromHostName(hostName);

            // Assert
            expect(actual).toEqual(expectedDomain);
        });
    });

    describe("Test function buildGameGuideUrl", () => {
        test("should return guide url", () => {
            //Arrange
            const expected = "https://guides.unittest.com";
            // Act
            const actual = urlHelper.buildGameGuideUrl();
            // Assert

            expect(actual).toEqual(expected);
        });
    });

    describe("Test function buildUrl", () => {
        test("should return url", () => {
            //Arrange
            const expected = `https://proxy.unittest.com/`;
            // Act
            const actual = urlHelper.buildUrl();
            // Assert

            expect(actual).toEqual(expected);
        });

        test("should return url with path", () => {
            //Arrange
            const expected = `https://proxy.unittest.com/path`;
            // Act
            const actual = urlHelper.buildUrl("http", "/path");
            // Assert

            expect(actual).toEqual(expected);
        });
    });

    describe("Test function buildProxyUrl", () => {
        test.each`
            path                       | env      | expectedProxyUrl
            ${"/game/configurations/"} | ${""}    | ${"https://client.unittest.com/game/configurations/"}
            ${"/game-client-13"}       | ${"dev"} | ${"https://client.unittest.com/dev/game-client-13"}
        `("should return ProxyUrl", ({ path, env, expectedProxyUrl }) => {
            Object.defineProperty(configs, "env", {
                value: env,
                writable: true
            });
            // Act
            const actual = urlHelper.buildProxyUrl(path);

            // Assert
            expect(actual).toEqual(expectedProxyUrl);
        });
    });

    describe("Test function getPath", () => {
        test("should return ProxyUrl", () => {
            //Arrange
            const expected = "/user/keno";
            // Act
            const actual = urlHelper.getPath(12);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("Test function getTrialSocket", () => {
        test("should return TrialSocket", () => {
            //Arrange
            const expected = "https://proxy.unittest.com/trial/keno";
            // Act
            const actual = urlHelper.getTrialSocket(12);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("Test function buildServerUrl", () => {
        test("should return ServerUrl", () => {
            //Arrange
            const expected = "https://proxy.unittest.com/user/keno";
            // Act
            const actual = urlHelper.buildServerUrl("http", "", 12);

            // Assert
            expect(actual).toEqual(expected);
        });
    });
});
