const defaultConfig = {
    systemType: "SC2",
    ssl: true,
    serverDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.31": "lumigame.com"
    },
    subDomain: "l2-proxy1",
    env: "",
    sentry: {
        url: "",
        env: "LOCAL2"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    gatewaySubDomain: "l2-gw2",
    subGuideDomain: "l1-guide1",
    enableMsgpackParserAllGames: false,
    enableMsgpackParserOnNotification: false,
    subPromotionDomain: "l2-promotion2",
    clientDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.31": "lumigame.com"
    }
    // clientSubDomain: "l1-client" // Turn on when new proxy for client && aws
};

const domainMapper = window.envConfig ? undefined : defaultConfig.serverDomainMapper;
const configs =
    window.envConfig && window.envConfig.isDev
        ? defaultConfig
        : { ...defaultConfig, serverDomainMapper: domainMapper, ...window.envConfig };

module.exports = configs;
