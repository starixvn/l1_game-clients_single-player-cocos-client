jest.mock("../../assets/common/GameUtils", () => jest.requireActual("./MockedGameUtils"));
jest.mock("bundle-management", () => jest.requireActual("./MockedBundleManager"));
