import _ = require("lodash");

const getNameCard = (index: number) => {
    const list = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    return list[index];
};

const getRandomCard = () => {
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const suits = [0, 1, 2, 3];

    const randomRank = _.random(0, ranks.length - 1, false);
    const randomSuit = _.random(0, suits.length - 1, false);
    return {
        rank: ranks[randomRank],
        suit: suits[randomSuit]
    };
};

export { getNameCard, getRandomCard };
