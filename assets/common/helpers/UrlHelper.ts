import * as configs from "../../configs/Configs";
import { getGameConfiguration } from "../../configs/GameConfigurations";

console.log("[UrlHelper] Loading UrlHelper module...");

export function buildUrl(protocol = "http", path = "/", overrideSubDomain = "") {
    console.log("🔗 [UrlHelper] Building URL with protocol:", protocol, "path:", path, "overrideSubDomain:", overrideSubDomain);
    const ssl = configs.ssl;
    const domain = getRootDomain();
    const subDomain = overrideSubDomain !== "" ? overrideSubDomain : configs.subDomain;
    const subDomainText = `${subDomain}.`;

    const url = `${protocol}${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${domain}${path}`;
    console.log("🔗 [UrlHelper] Built URL:", url);
    return url;
}

export function getRootDomain() {
    console.log("🔗 [UrlHelper] Getting root domain");
    const hostName = window.location.hostname;
    console.log("🔗 [UrlHelper] Hostname:", hostName);

    const domain = (!!configs.serverDomainMapper && configs.serverDomainMapper[hostName]) || extractDomainFromHostName(hostName);
    console.log("🔗 [UrlHelper] Root domain:", domain);
    return domain;
}

export function extractDomainFromHostName(hostName: string) {
    console.log("🔗 [UrlHelper] Extracting domain from hostname:", hostName);
    const domainParts = hostName.split(".").reverse();
    const domain = `${domainParts[1]}.${domainParts[0]}`;
    console.log("🔗 [UrlHelper] Extracted domain:", domain);
    return domain;
}

export function buildGameGuideUrl() {
    console.log("🔗 [UrlHelper] Building game guide URL");
    const ssl = configs.ssl;
    const rootDomain = getRootDomain();
    const subGuideDomainText = `${configs.subGuideDomain}.`;

    const url = `${"http"}${ssl ? "s" : ""}://${subGuideDomainText}${rootDomain}`;
    console.log("🔗 [UrlHelper] Game guide URL:", url);
    return url;
}

export function buildPromotionSiteUrl() {
    console.log("🔗 [UrlHelper] Building promotion site URL");
    if (configs.subPromotionDomain) {
        const ssl = configs.ssl;
        const rootDomain = getRootDomain();
        const subPromotionDomainText = `${configs.subPromotionDomain}.`;
        const url = `${"http"}${ssl ? "s" : ""}://${subPromotionDomainText}${rootDomain}`;
        console.log("🔗 [UrlHelper] Promotion site URL (with subdomain):", url);
        return url;
    }
    const proxyUrl = buildProxyUrl(`/promotion`);
    console.log("🔗 [UrlHelper] Promotion site URL (proxy):", proxyUrl);
    return proxyUrl;
}

export function buildGatewayUrl() {
    console.log("🔗 [UrlHelper] Building gateway URL");
    const url = buildUrlFromSubDomain(configs.gatewaySubDomain);
    console.log("🔗 [UrlHelper] Gateway URL:", url);
    return url;
}

export function buildUrlFromSubDomain(subDomain) {
    console.log("🔗 [UrlHelper] Building URL from subdomain:", subDomain);
    const url = `${"http"}${configs.ssl ? "s" : ""}://${subDomain}.${getRootDomain()}`;
    console.log("🔗 [UrlHelper] URL from subdomain:", url);
    return url;
}

export function buildUrlWithPath(path) {
    console.log("🔗 [UrlHelper] Building URL with path:", path);
    const url = buildUrl("http", path);
    console.log("🔗 [UrlHelper] URL with path:", url);
    return url;
}

export function buildServerUrl(protocol = "http", path = "/", gameId = 0) {
    console.log("🔗 [UrlHelper] Building server URL with protocol:", protocol, "path:", path, "gameId:", gameId);
    const gamePath = getPath(gameId);
    const url = buildUrl(protocol, gamePath + path);
    console.log("🔗 [UrlHelper] Server URL:", url);
    return url;
}

export function buildProxyUrl(path) {
    console.log("🔗 [UrlHelper] Building proxy URL with path:", path);
    const envPath = configs.env === "" ? "" : `/${configs.env}`;
    const fullPath = `${envPath}${path}`;
    const url = buildUrl("http", fullPath);
    console.log("🔗 [UrlHelper] Proxy URL:", url);
    return url;
}

export function getClientRootDomain() {
    console.log("🔗 [UrlHelper] Getting client root domain");
    const hostName = window.location.hostname;
    const domain = (!!configs.clientDomainMapper && configs.clientDomainMapper[hostName]) || extractDomainFromHostName(hostName);
    console.log("🔗 [UrlHelper] Client root domain:", domain);
    return domain;
}

export function buildClientUrl(path, overrideSubDomain = "") {
    console.log("🔗 [UrlHelper] Building client URL with path:", path, "overrideSubDomain:", overrideSubDomain);
    const ssl = configs.ssl;
    const domain = getClientRootDomain();
    const envPath = configs.env === "" ? "" : `/${configs.env}`;
    const fullPath = `${envPath}${path}`;
    const subDomainConfig = configs.clientSubDomain ?? configs.subDomain;
    const subDomain = overrideSubDomain !== "" ? overrideSubDomain : subDomainConfig;
    const subDomainText = subDomain == null ? "" : `${subDomain}.`;

    const url = `http${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${domain}${fullPath}`;
    console.log("🔗 [UrlHelper] Client URL:", url);
    return url;
}

export function buildMicrositeGameUrl(gameId) {
    console.log("🔗 [UrlHelper] Building microsite game URL for gameId:", gameId);
    const url = buildClientUrl(`/site-${gameId}`);
    console.log("🔗 [UrlHelper] Microsite game URL:", url);
    return url;
}

export function getTrialSocket(gameId) {
    console.log("🔗 [UrlHelper] Getting trial socket for gameId:", gameId);
    const gameConfiguration = getGameConfiguration(gameId);
    const path = gameConfiguration?.key.toLowerCase();
    const pathStr = `/trial/${path}`;
    const url = buildUrl("http", `${pathStr}`);
    console.log("🔗 [UrlHelper] Trial socket URL:", url);
    return url;
}

export function getPath(gameId) {
    console.log("🔗 [UrlHelper] Getting path for gameId:", gameId);
    const gameConfiguration = getGameConfiguration(gameId);
    const path = gameConfiguration?.key.toLowerCase();
    let pathStr = "";
    if (gameId === 0) {
        pathStr = `/${getEnvironment()}${path}`;
    } else {
        pathStr = `/user/${path}`;
    }

    console.log("🔗 [UrlHelper] Path:", pathStr);
    return pathStr;
}

export function getProxyRoute(gameId) {
    console.log("🔗 [UrlHelper] Getting proxy route for gameId:", gameId);
    const gameConfiguration = getGameConfiguration(gameId);
    const route = gameConfiguration?.route || gameConfiguration?.key.toLowerCase();
    const proxyRoute = `/${getEnvironment()}${route}/socket.io`;
    console.log("🔗 [UrlHelper] Proxy route:", proxyRoute);
    return proxyRoute;
}

export function getEnvironment() {
    console.log("🔗 [UrlHelper] Getting environment");
    const env = configs.env;
    let envStr = "";
    if (env.length > 0) {
        envStr = `${env}/`;
    }

    console.log("🔗 [UrlHelper] Environment string:", envStr);
    return envStr;
}

export function buildShareResource() {
    console.log("🔗 [UrlHelper] Building share resource URL");
    const url = buildClientUrl(`/shared-resources`);
    console.log("🔗 [UrlHelper] Share resource URL:", url);
    return url;
}

export function buildSharedResourceUrl(path: string) {
    console.log("🔗 [UrlHelper] Building shared resource URL with path:", path);
    const url = buildShareResource();
    const fullUrl = `${url}/${path}`;
    console.log("🔗 [UrlHelper] Shared resource URL:", fullUrl);
    return fullUrl;
}

console.log("[UrlHelper] UrlHelper module loaded successfully");
