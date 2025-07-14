import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: {
        52: "Mega Keno",
        53: "Mega Keno 2",
        14: "Keno Mini",
        15: "Keno Mini 2",
        16: "Keno East",
        17: "Keno West",
        18: "Keno South",
        19: "Keno North"
    },
    lobbyNames: {
        52: "Mega Keno"
    },
    megaKeno: {
        intro: "“Mega Keno - 多人游戏”是一款具有新功能的 RNG 游戏，可让您在 8 个赌桌（Mega Keno、Mega Keno 2、Keno Mini、Keno Mini 2、Keno North、Keno South、Keno West、Keno East）上玩 同时体验许多激动人心的新体验。",
        RNGKeno80Balls: "RNG Keno（80 球）",
        RNGKeno40Balls: "RNG Keno（40 球）"
    }
};

reloadLanguageData("zh_cn", phrases);
