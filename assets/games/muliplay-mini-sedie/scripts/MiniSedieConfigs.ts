const turboConfig = {
    minBetTime: 1,
    fullTime: 38,
    betTime: 30,
    stopBetTime: 5,
    waitTime: 5
};

const normalConfig = {
    minBetTime: 1,
    fullTime: 43,
    betTime: 35,
    stopBetTime: 5,
    waitTime: 5
};

export const MiniSedie1Id = 9;
export const MiniSedie2Id = 56;
export const MiniSedie3Id = 57;
export const MiniSedie4Id = 58;

export const miniSedieConfigs = {
    [MiniSedie1Id]: turboConfig,
    [MiniSedie2Id]: turboConfig,
    [MiniSedie3Id]: normalConfig,
    [MiniSedie4Id]: normalConfig
};

export const tableGameColor = {
    [MiniSedie1Id]: "#00b8f0",
    [MiniSedie2Id]: "#00cc44",
    [MiniSedie3Id]: "#6d00cc",
    [MiniSedie4Id]: "#cc0011"
};

export const MiniSedieIds = [MiniSedie1Id, MiniSedie2Id, MiniSedie3Id, MiniSedie4Id];
