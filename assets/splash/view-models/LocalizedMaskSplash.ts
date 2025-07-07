import { OperatorAlias } from "../../ISystem";
import * as sessionManager from "../../common/auth/SessionManager";
import LocalizedMask from "../../common/i18n/LocalizedMask";

const { ccclass } = cc._decorator;

@ccclass
export default class LocalizedMaskSplash extends LocalizedMask {
    getSpriteFrameByLang(lang: string) {
        const system = sessionManager.getOperator()?.toUpperCase() === OperatorAlias.SG ? "sc1" : "sc2";
        try {
            cc.resources.load<cc.SpriteFrame>(`splash/images/tagline_${system}_${lang}`, cc.SpriteFrame, (err, frame) => {
                this.spriteFrame = frame;

                return frame ?? null;
            });
        } catch (e) {}

        return null;
    }
}
