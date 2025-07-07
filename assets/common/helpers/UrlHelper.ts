import * as configs from "../../configs/Configs";
import { getGameConfiguration } from "../../configs/GameConfigurations";

export function buildUrl(protocol = "http", path = "/", overrideSubDomain = "") {
    const ssl = configs.ssl;
    const domain = getRootDomain();
    const subDomain = overrideSubDomain !== "" ? overrideSubDomain : configs.subDomain;
    const subDomainText = `${subDomain}.`;

    return `${protocol}${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${domain}${path}`;
}

export function getRootDomain() {
    const hostName = window.location.hostname;
    return (!!configs.serverDomainMapper && configs.serverDomainMapper[hostName]) || extractDomainFromHostName(hostName);
}

export function extractDomainFromHostName(hostName: string) {
    const domainParts = hostName.split(".").reverse();
    return `${domainParts[1]}.${domainParts[0]}`;
}

export function buildGameGuideUrl() {
    const ssl = configs.ssl;
    const rootDomain = getRootDomain();
    const subGuideDomainText = `${configs.subGuideDomain}.`;

    return `${"http"}${ssl ? "s" : ""}://${subGuideDomainText}${rootDomain}`;
}

export function buildPromotionSiteUrl() {
    if (configs.subPromotionDomain) {
        const ssl = configs.ssl;
        const rootDomain = getRootDomain();
        const subPromotionDomainText = `${configs.subPromotionDomain}.`;
        return `${"http"}${ssl ? "s" : ""}://${subPromotionDomainText}${rootDomain}`;
    }
    return buildProxyUrl(`/promotion`);
}

export function buildGatewayUrl() {
    return buildUrlFromSubDomain(configs.gatewaySubDomain);
}

export function buildUrlFromSubDomain(subDomain) {
    return `${"http"}${configs.ssl ? "s" : ""}://${subDomain}.${getRootDomain()}`;
}

export function buildUrlWithPath(path) {
    return buildUrl("http", path);
}

export function buildServerUrl(protocol = "http", path = "/", gameId = 0) {
    const gamePath = getPath(gameId);
    return buildUrl(protocol, gamePath + path);
}

export function buildProxyUrl(path) {
    const envPath = configs.env === "" ? "" : `/${configs.env}`;
    const fullPath = `${envPath}${path}`;

    return buildUrl("http", fullPath);
}

export function getClientRootDomain() {
    const hostName = window.location.hostname;
    return (!!configs.clientDomainMapper && configs.clientDomainMapper[hostName]) || extractDomainFromHostName(hostName);
}

export function buildClientUrl(path, overrideSubDomain = "") {
    const ssl = configs.ssl;
    const domain = getClientRootDomain();
    const envPath = configs.env === "" ? "" : `/${configs.env}`;
    const fullPath = `${envPath}${path}`;
    const subDomainConfig = configs.clientSubDomain ?? configs.subDomain;
    const subDomain = overrideSubDomain !== "" ? overrideSubDomain : subDomainConfig;
    const subDomainText = subDomain == null ? "" : `${subDomain}.`;

    return `http${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${domain}${fullPath}`;
}

export function buildMicrositeGameUrl(gameId) {
    return buildClientUrl(`/site-${gameId}`);
}

export function getTrialSocket(gameId) {
    const gameConfiguration = getGameConfiguration(gameId);
    const path = gameConfiguration?.key.toLowerCase();
    const pathStr = `/trial/${path}`;
    return buildUrl("http", `${pathStr}`);
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

    return `/${getEnvironment()}${route}/socket.io`;
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
    return buildClientUrl(`/shared-resources`);
}

export function buildSharedResourceUrl(path: string) {
    const url = buildShareResource();
    return `${url}/${path}`;
}
