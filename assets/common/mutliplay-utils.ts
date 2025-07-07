export const multiplayGames = {
    50: [
        51,
        54,
        55 // UnbalancedBigSmall
    ],
    9: [
        56,
        57,
        58 // MiniSedie
    ],
    52: [
        53,
        14,
        15,
        16,
        17,
        18,
        19 //mega keno
    ]
};

export const isMainMultiplayGame = (gameId: number) => {
    return Object.keys(multiplayGames).includes(`${gameId}`);
};

export const isSubMultiplayGame = (gameId: number) => {
    return Object.values(multiplayGames).flat().includes(gameId);
};

export const isMultiplayGame = (gameId: number) => {
    const isMain = isMainMultiplayGame(gameId);
    return isMain ? true : isSubMultiplayGame(gameId);
};

export const getMainMultiplayGame = (gameId: number) => {
    const key = Object.keys(multiplayGames).find((key) => {
        return multiplayGames[key].includes(gameId);
    });
    if (key) {
        return +key;
    } else {
        console.log("Can not get main multiplay for game ", gameId);
        return -1;
    }
};
