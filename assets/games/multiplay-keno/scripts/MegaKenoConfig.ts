export const MegaKeno1Id = 52;
export const MegaKeno2Id = 53;
export const MegaKeno3Id = 14;
export const MegaKeno4Id = 15;
export const MegaKeno5Id = 16;
export const MegaKeno6Id = 17;
export const MegaKeno7Id = 18;
export const MegaKeno8Id = 19;

const megaConfig = {
    minBetTime: 1,
    fullTime: 58,
    betTime: 45,
    stopBetTime: 5,
    waitTime: 10
};

const miniKenoConfig = {
    minBetTime: 1,
    fullTime: 51,
    betTime: 40,
    stopBetTime: 5,
    waitTime: 7
};

const miniKenoConfig2 = {
    minBetTime: 1,
    fullTime: 41,
    betTime: 30,
    stopBetTime: 5,
    waitTime: 7
};

const normalConfig = {
    minBetTime: 1,
    fullTime: 43,
    betTime: 30,
    stopBetTime: 5,
    waitTime: 5
};

export const MegaKenoConfigs = {
    [MegaKeno1Id]: megaConfig,
    [MegaKeno2Id]: normalConfig,
    [MegaKeno3Id]: miniKenoConfig,
    [MegaKeno4Id]: miniKenoConfig2,
    [MegaKeno5Id]: normalConfig,
    [MegaKeno6Id]: normalConfig,
    [MegaKeno7Id]: normalConfig,
    [MegaKeno8Id]: normalConfig
};

export const KenoTableGameColor = {
    [MegaKeno1Id]: "#520092",
    [MegaKeno2Id]: "#520092",
    [MegaKeno3Id]: "#196c00",
    [MegaKeno4Id]: "#196c00",
    [MegaKeno5Id]: "#956200",
    [MegaKeno6Id]: "#956200",
    [MegaKeno7Id]: "#956200",
    [MegaKeno8Id]: "#956200"
};
