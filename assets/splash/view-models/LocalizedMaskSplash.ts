import { OperatorAlias } from "../../ISystem";
import * as sessionManager from "../../common/auth/SessionManager";
import LocalizedMask from "../../common/i18n/LocalizedMask";

const { ccclass } = cc._decorator;

@ccclass
export default class LocalizedMaskSplash extends LocalizedMask {
    getSpriteFrameByLang(lang: string) {
        const operator = sessionManager.getOperator()?.toUpperCase();
        const system = operator === OperatorAlias.SG ? "sc1" : "sc2";

        const resourcePath = `splash/images/tagline_${system}_${lang}`;

        try {
            cc.resources.load<cc.SpriteFrame>(resourcePath, cc.SpriteFrame, (err, frame) => {
                if (err) {
                    return;
                }
                this.spriteFrame = frame;
                return frame ?? null;
            });
        } catch (e) {
            // Handle exception silently
        }

        return null;
    }
}
