console.log("[Configs] Loading Configs module...");

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
    gatewaySubDomain: "l2-gw1",
    subGuideDomain: "l2-guide-1",
    enableMsgpackParserAllGames: false,
    enableMsgpackParserOnNotification: false,
    subPromotionDomain: "l2-promotion2",
    clientDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.31": "lumigame.com"
    }
    // clientSubDomain: "l1-client" // Turn on when new proxy for client && aws
};

console.log("[Configs] Default config loaded:", defaultConfig);

const domainMapper = window.envConfig ? undefined : defaultConfig.serverDomainMapper;
console.log("[Configs] Domain mapper:", domainMapper);
console.log("[Configs] Window envConfig:", window.envConfig);

const configs =
    window.envConfig && window.envConfig.isDev
        ? defaultConfig
        : { ...defaultConfig, serverDomainMapper: domainMapper, ...window.envConfig };

console.log("[Configs] Final configs resolved:", configs);

module.exports = configs;

console.log("[Configs] Configs module loaded successfully");
