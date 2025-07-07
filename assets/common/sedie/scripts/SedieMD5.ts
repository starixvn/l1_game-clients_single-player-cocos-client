import MD5Component, { MD5Type } from "../../../games/_base/view-models/MD5Component";

const { ccclass } = cc._decorator;
export type ExtraInfos = {
    red1: boolean;
    red2: boolean;
    red3: boolean;
    red4: boolean;
};
@ccclass
export default class SedieMD5 extends MD5Component {
    readonly CHIP_RED = `<img src="chip_do" />`;
    readonly CHIP_WHITE = `<img src="chip_trang" />`;

    generateMD5Result(data: MD5Type) {
        let result = "";
        if (!!data.extraInfos) {
            const totalRed = Object.values(data.extraInfos).filter((value) => value === true).length;
            const chipResult = this.generateChips(totalRed);
            const suffix = data.rawValue.split("_");
            const suffixFormatLength = suffix[1].length > this.lengthOfMd5 ? suffix[1].slice(0, this.lengthOfMd5) + "..." : suffix[1];
            result = `{${chipResult}}_${suffixFormatLength}`;
        }
        if (!!data.hashValue) {
            result = data.hashValue;
        }
        this.md5Value.string = `${result}`;
    }

    generateChips(totalRed: number) {
        const chips = {
            0: `${this.CHIP_WHITE} ${this.CHIP_WHITE} ${this.CHIP_WHITE} ${this.CHIP_WHITE}`,
            1: `${this.CHIP_RED} ${this.CHIP_WHITE} ${this.CHIP_WHITE} ${this.CHIP_WHITE}`,
            2: `${this.CHIP_RED} ${this.CHIP_RED} ${this.CHIP_WHITE} ${this.CHIP_WHITE}`,
            3: `${this.CHIP_RED} ${this.CHIP_RED} ${this.CHIP_RED} ${this.CHIP_WHITE}`,
            4: `${this.CHIP_RED} ${this.CHIP_RED} ${this.CHIP_RED} ${this.CHIP_RED}`
        };

        return chips.hasOwnProperty(totalRed) ? chips[totalRed] : "";
    }
}
