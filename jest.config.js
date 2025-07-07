const defaultSourcePaths = "assets/**/*.ts";
const defaultTestPaths = "__tests__";

const collectCoverageFrom = (process.env.SOURCE_PATHS || defaultSourcePaths).split(",").map((path) => `${path}/**/*.ts`);
const testMatch = (process.env.TEST_PATHS || defaultTestPaths)
    .split(",")
    .map((path) => `**/${path.replace("./", "")}/**/?(*.)+(spec|test).+(ts)`);

module.exports = {
    preset: "ts-jest/presets/js-with-ts",
    testResultsProcessor: "jest-sonar-reporter",
    collectCoverageFrom,
    coverageDirectory: "coverage",
    setupFiles: ["jest-canvas-mock", "./__tests__/utils/cocos2d-js-for-preview.js"],
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["/lib/", "/node_modules/", "/mocks/"],
    moduleFileExtensions: ["ts", "js"],
    testMatch,
    transformIgnorePatterns: ["cocos2d-js-for-preview.js"],
    clearMocks: true,
    setupFilesAfterEnv: ["./__tests__/mocks/setup-jest.js"]
};
