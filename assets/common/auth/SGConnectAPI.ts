import * as Configs from "../../configs/Configs";
import { buildUrlFromSubDomain } from "../helpers/UrlHelper";



const redirectToAppTimeoutPage = (language = "en-US"): void => {
    
    redirectToAppPage("/timeout", language);
};

const redirectToAppUMPage = (operatorId: string, language = "en-US"): void => {
    
    const otherQueryString = operatorId ? `operatorId=${operatorId}` : "";
    
    redirectToAppPage("/um", language, otherQueryString);
};

const redirectToLoginPage = (language = "en-US"): void => {
    
    redirectToAppPage("/relogin", language);
};

const redirectToAppPage = (path: string, language: string, otherQueryString = ""): void => {
    
    const subDomainUrl = buildUrlFromSubDomain(Configs.SGConnectSubDomain);
    

    const redirectUrl = `${subDomainUrl}${path}?language=${language}&${otherQueryString}`;
    

    
    window.location.href = redirectUrl;
};

export { redirectToAppTimeoutPage, redirectToAppUMPage, redirectToLoginPage };


