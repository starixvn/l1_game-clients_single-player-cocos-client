import { OperatorAlias } from "../../ISystem";
import * as sessionManager from "../../common/auth/SessionManager";
import LocalizedMask from "../../common/i18n/LocalizedMask";

const { ccclass } = cc._decorator;

@ccclass
export default class LocalizedMaskSplash extends LocalizedMask {
    getSpriteFrameByLang(lang: string) {
        console.log(`[LocalizedMaskSplash] Getting sprite frame for language: ${lang}`);
        const operator = sessionManager.getOperator()?.toUpperCase();
        const system = operator === OperatorAlias.SG ? "sc1" : "sc2";
        console.log(`[LocalizedMaskSplash] Operator: ${operator}, System: ${system}`);

        const resourcePath = `splash/images/tagline_${system}_${lang}`;
        console.log(`[LocalizedMaskSplash] Loading resource from path: ${resourcePath}`);

        try {
            cc.resources.load<cc.SpriteFrame>(resourcePath, cc.SpriteFrame, (err, frame) => {
                if (err) {
                    console.error(`[LocalizedMaskSplash] Failed to load sprite frame: ${err.message}`);
                    return;
                }
                console.log(`[LocalizedMaskSplash] Successfully loaded sprite frame for ${lang}`);
                this.spriteFrame = frame;
                return frame ?? null;
            });
        } catch (e) {
            console.error('[LocalizedMaskSplash] Exception while loading sprite frame:', e);
        }

        return null;
    }
}
