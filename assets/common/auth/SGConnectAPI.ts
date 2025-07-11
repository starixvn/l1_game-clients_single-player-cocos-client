import * as Configs from "../../configs/Configs";
import { buildUrlFromSubDomain } from "../helpers/UrlHelper";

console.log("[SGConnectAPI] Loading SGConnectAPI module...");

const redirectToAppTimeoutPage = (language = "en-US"): void => {
    console.log("🔗 [SGConnectAPI] Redirecting to app timeout page with language:", language);
    redirectToAppPage("/timeout", language);
};

const redirectToAppUMPage = (operatorId: string, language = "en-US"): void => {
    console.log("🔗 [SGConnectAPI] Redirecting to app UM page with operatorId:", operatorId, "language:", language);
    const otherQueryString = operatorId ? `operatorId=${operatorId}` : "";
    console.log("🔗 [SGConnectAPI] Other query string:", otherQueryString);
    redirectToAppPage("/um", language, otherQueryString);
};

const redirectToLoginPage = (language = "en-US"): void => {
    console.log("🔗 [SGConnectAPI] Redirecting to login page with language:", language);
    redirectToAppPage("/relogin", language);
};

const redirectToAppPage = (path: string, language: string, otherQueryString = ""): void => {
    console.log("🔗 [SGConnectAPI] Building redirect URL with path:", path, "language:", language, "otherQueryString:", otherQueryString);
    const subDomainUrl = buildUrlFromSubDomain(Configs.SGConnectSubDomain);
    console.log("🔗 [SGConnectAPI] Sub domain URL:", subDomainUrl);

    const redirectUrl = `${subDomainUrl}${path}?language=${language}&${otherQueryString}`;
    console.log("🔗 [SGConnectAPI] Final redirect URL:", redirectUrl);

    console.log("🔗 [SGConnectAPI] Executing redirect...");
    window.location.href = redirectUrl;
};

export { redirectToAppTimeoutPage, redirectToAppUMPage, redirectToLoginPage };

console.log("[SGConnectAPI] SGConnectAPI module loaded successfully");
