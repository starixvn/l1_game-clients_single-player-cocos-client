import * as configs from "../../configs/Configs";
import { getGameConfiguration } from "../../configs/GameConfigurations";



export function buildUrl(protocol = "http", path = "/", overrideSubDomain = "") {

    const ssl = configs.ssl;
    const domain = getRootDomain();
    const subDomain = overrideSubDomain !== "" ? overrideSubDomain : configs.subDomain;
    const subDomainText = `${subDomain}.`;

    const url = `${protocol}${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${domain}${path}`;

    return url;
}

export function getRootDomain() {

    const hostName = window.location.hostname;


    const domain = (!!configs.serverDomainMapper && configs.serverDomainMapper[hostName]) || extractDomainFromHostName(hostName);

    return domain;
}

export function extractDomainFromHostName(hostName: string) {

    const domainParts = hostName.split(".").reverse();
    const domain = `${domainParts[1]}.${domainParts[0]}`;

    return domain;
}

export function buildGameGuideUrl() {

    const ssl = configs.ssl;
    const rootDomain = getRootDomain();
    const subGuideDomainText = `${configs.subGuideDomain}.`;

    const url = `${"http"}${ssl ? "s" : ""}://${subGuideDomainText}${rootDomain}`;

    return url;
}

export function buildPromotionSiteUrl() {

    if (configs.subPromotionDomain) {
        const ssl = configs.ssl;
        const rootDomain = getRootDomain();
        const subPromotionDomainText = `${configs.subPromotionDomain}.`;
        const url = `${"http"}${ssl ? "s" : ""}://${subPromotionDomainText}${rootDomain}`;
        return url;
    }
    const proxyUrl = buildProxyUrl(`/promotion`);
    return proxyUrl;
}

export function buildGatewayUrl() {

    const url = buildUrlFromSubDomain(configs.gatewaySubDomain);

    return url;
}

export function buildUrlFromSubDomain(subDomain) {

    const url = `${"http"}${configs.ssl ? "s" : ""}://${subDomain}.${getRootDomain()}`;

    return url;
}

export function buildUrlWithPath(path) {

    const url = buildUrl("http", path);

    return url;
}

export function buildServerUrl(protocol = "http", path = "/", gameId = 0) {

    const gamePath = getPath(gameId);
    const url = buildUrl(protocol, gamePath + path);

    return url;
}

export function buildProxyUrl(path) {

    const envPath = configs.env === "" ? "" : `/${configs.env}`;
    const fullPath = `${envPath}${path}`;
    const url = buildUrl("http", fullPath);

    return url;
}

export function getClientRootDomain() {

    const hostName = window.location.hostname;
    const domain = (!!configs.clientDomainMapper && configs.clientDomainMapper[hostName]) || extractDomainFromHostName(hostName);

    return domain;
}

export function buildClientUrl(path, overrideSubDomain = "") {

    const ssl = configs.ssl;
    const domain = getClientRootDomain();
    const envPath = configs.env === "" ? "" : `/${configs.env}`;
    const fullPath = `${envPath}${path}`;
    const subDomainConfig = configs.clientSubDomain ?? configs.subDomain;
    const subDomain = overrideSubDomain !== "" ? overrideSubDomain : subDomainConfig;
    const subDomainText = subDomain == null ? "" : `${subDomain}.`;

    const url = `http${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${domain}${fullPath}`;

    return url;
}

export function buildMicrositeGameUrl(gameId) {

    const url = buildClientUrl(`/site-${gameId}`);

    return url;
}

export function getTrialSocket(gameId) {

    const gameConfiguration = getGameConfiguration(gameId);
    const path = gameConfiguration?.key.toLowerCase();
    const pathStr = `/trial/${path}`;
    const url = buildUrl("http", `${pathStr}`);

    return url;
}

export function getPath(gameId) {

    const gameConfiguration = getGameConfiguration(gameId);
    const path = gameConfiguration?.key.toLowerCase();
    let pathStr = "";
    if (gameId === 0) {
        pathStr = `/${getEnvironment()}${path}`;
    } else {
        pathStr = `/user/${path}`;
    }


    return pathStr;
}

export function getProxyRoute(gameId) {

    const gameConfiguration = getGameConfiguration(gameId);
    const route = gameConfiguration?.route || gameConfiguration?.key.toLowerCase();
    const proxyRoute = `/${getEnvironment()}${route}/socket.io`;

    return proxyRoute;
}

export function getEnvironment() {

    const env = configs.env;
    let envStr = "";
    if (env.length > 0) {
        envStr = `${env}/`;
    }


    return envStr;
}

export function buildShareResource() {

    const url = buildClientUrl(`/shared-resources`);

    return url;
}

export function buildSharedResourceUrl(path: string) {

    const url = buildShareResource();
    const fullUrl = `${url}/${path}`;

    return fullUrl;
}


