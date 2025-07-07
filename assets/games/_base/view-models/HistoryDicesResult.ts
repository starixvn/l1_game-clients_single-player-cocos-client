import { i18n } from "../../../ClientModules";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HistoryDicesResult extends cc.Component {
    @property(cc.Sprite)
    dice1: cc.Sprite = null;

    @property(cc.Sprite)
    dice2: cc.Sprite = null;

    @property(cc.Sprite)
    dice3: cc.Sprite = null;

    @property(cc.Label)
    total: cc.Label = null;

    @property(cc.SpriteAtlas)
    mainAtlas: cc.SpriteAtlas = null;

    setResult(data: any, settlementResult: any) {
        const winChoice = Object.keys(settlementResult).find((choice) => settlementResult[choice]);
        const winChoiceString = i18n.t(`ui.choice_${winChoice}`);
        this.total.string = `${data.dice1 + data.dice2 + data.dice3} - ` + winChoiceString;
        this.dice1.spriteFrame = this.mainAtlas.getSpriteFrame(`Dice-${data.dice1}`);
        this.dice2.spriteFrame = this.mainAtlas.getSpriteFrame(`Dice-${data.dice2}`);
        this.dice3.spriteFrame = this.mainAtlas.getSpriteFrame(`Dice-${data.dice3}`);
    }
}
