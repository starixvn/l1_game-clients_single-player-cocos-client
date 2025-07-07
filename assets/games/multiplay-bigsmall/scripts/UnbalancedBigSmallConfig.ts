export const UnbalancedBigSmall1Id = 50;
export const UnbalancedBigSmall2Id = 51;
export const UnbalancedBigSmall3Id = 54;
export const UnbalancedBigSmall4Id = 55;

const normalConfig = {
    minBetTime: 1,
    fullTime: 60,
    betTime: 50,
    stopBetTime: 5,
    waitTime: 5
};

const turboConfig = {
    minBetTime: 1,
    fullTime: 40,
    betTime: 30,
    stopBetTime: 5,
    waitTime: 5
};

export const unbalancedBigSmallConfigs = {
    [UnbalancedBigSmall1Id]: normalConfig,
    [UnbalancedBigSmall2Id]: turboConfig,
    [UnbalancedBigSmall3Id]: normalConfig,
    [UnbalancedBigSmall4Id]: turboConfig
};

export const tableGameColor = {
    [UnbalancedBigSmall1Id]: "#00becc",
    [UnbalancedBigSmall2Id]: "#00cc44",
    [UnbalancedBigSmall3Id]: "#6d00cc",
    [UnbalancedBigSmall4Id]: "#cc0011"
};
