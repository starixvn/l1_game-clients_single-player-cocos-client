import RoundResultBase from "../../../common/round-result/RoundResultBase";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BigSmallRoundResult extends RoundResultBase {
    updateLabels(data: any) {
        const { settlementResult, result } = data;
        const lang = window.i18n.curLang === "vi" ? "" : `_${window.i18n.curLang}`;
        const choice = this.getTextFollowChoice({ settlementResult });
        const name = `scoreboard_${choice}`;

        this.total.spriteFrame = this.atlas.getSpriteFrame(result.dice1 + result.dice2 + result.dice3);

        this.result.spriteFrame = this.getSpriteFrameByLang(name, lang);
    }

    getTextFollowChoice({ settlementResult }): string {
        return settlementResult.big ? "big" : "small";
    }

    getSpriteFrameByLang(name: string, lang: string) {
        const spriteName = `${name}${lang}`;
        return this.atlas.getSpriteFrame(spriteName);
    }
}
