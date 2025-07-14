import { buildUrlWithPath } from "../../../common/helpers/UrlHelper";
import LoadWebView from "../../../common/LoadWebView";
import * as config from "../../../configs/Configs";

const { ccclass } = cc._decorator;

@ccclass
export default class BitcoinMasterChart extends LoadWebView {
    public needDisableDivScroll = true;

    initURL(sessionID: string) {
        const env = config.env === "" ? "" : `/${config.env}`;
        this.url = buildUrlWithPath(
            `${env}/bitcoinmaster/chart${
                config.enableMsgpackParserAllGames ? "-msgPack" : ""
            }.html?ss=${sessionID}&t=${new Date().getTime()}`
        );
    }
}
