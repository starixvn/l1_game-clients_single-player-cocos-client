window.envConfig = {
    isDev: true,
    systemType: "VG",
    ssl: true,
    serverDomainMapper: {
        "l2-games.lumigame.com": "lumigame.com"
    },
    subDomain: "l2-proxy",
    env: "",
    sentry: {
        url: "https://2af29bdacdbf4d9ba2db6600b450541f@sentry.lumigame.com/28",
        env: "LOCAL"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    guideDomain: "https://l2-guide.lumigame.com",
    enableMsgpackParserAllGames: false,
    enableMsgpackParserOnNotification: false
};

console.error("Wrong mapping config, please check your deployment");
