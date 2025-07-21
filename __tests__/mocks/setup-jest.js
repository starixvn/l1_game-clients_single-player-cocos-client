// Jest setup file
import { jest } from "@jest/globals";

// Mock GameUtils
jest.mock("../assets/common/GameUtils", () => ({
    __esModule: true,
    default: {
        loadRemote: jest.fn(),
        getAvatarSprite: jest.fn()
    }
}));

// Mock numberWithCommas helper
jest.mock("../assets/common/helpers/NumberHelper", () => ({
    numberWithCommas: jest.fn((value, decimals = 2) => {
        return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    })
}));

// Global test setup
beforeEach(() => {
    jest.clearAllMocks();
});
