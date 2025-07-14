import * as i18n from "i18n/runtime-scripts/LanguageData";

import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { SCATTER_SYMBOL } from "./CascadingSlotUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingSlotTumbleItem extends cc.Component {
    @property(cc.Label)
    numberIcon: cc.Label = null;

    @property(cc.Sprite)
    symbol: cc.Sprite = null;

    @property(cc.Label)
    winningValue: cc.Label = null;

    @property(cc.SpriteAtlas)
    mainAtlas: cc.SpriteAtlas = null;

    protected prefixSymbol = "symbol_";
    protected index = 1;

    setData(icon: number, count: number, win: number) {
        this.numberIcon.string = count.toString();
        this.winningValue.string = numberWithCommas(win, 2, false);
        this.symbol.spriteFrame = this.mainAtlas.getSpriteFrame(`${this.prefixSymbol}${icon + this.index}`);
    }

    setDataForFreeSpinTumble(count: number, win: number, freeSpin: boolean) {
        const freeSpinTxt = freeSpin ? `cascadingSlot.extraFreeSpin` : `cascadingSlot.freeSpin`;
        this.numberIcon.string = count.toString();
        this.winningValue.string = win.toString() + ` ${i18n.t(freeSpinTxt)}`;
        this.symbol.spriteFrame = this.mainAtlas.getSpriteFrame(`${this.prefixSymbol}${SCATTER_SYMBOL + this.index}`);
    }
}
