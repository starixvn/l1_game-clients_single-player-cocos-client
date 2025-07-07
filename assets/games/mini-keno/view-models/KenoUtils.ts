import GameUtils from "../../../common/GameUtils";

export enum KenoType {
    ProViet,
    Mega,
    Mega2,
    Mini,
    Mini2,
    East,
    West,
    South,
    North
}

export const MegaKenoId = 52;
export const MegaKeno2Id = 53;
export const KenoMiniId = 14;
export const KenoMini2Id = 15;
export const KenoEastId = 16;
export const KenoWestId = 17;
export const KenoSouthId = 18;
export const KenoNorthId = 19;

export default class KenoUtils {
    public static getKenoRuleChoice(choice: string, isMini = false) {
        const rules = {
            big: "[811-1410]",
            small: "[210-810]",
            odd: "",
            even: "",
            gold: "[210-695]",
            wood: "[696-763]",
            water: "[764-855]",
            fire: "[856-923]",
            earth: "[924-1410]"
        };
        const rules2 = {
            big: "[206-355]",
            small: "[55-205]",
            odd: "",
            even: "",
            gold: "[55-163]",
            wood: "[164-187]",
            water: "[188-222]",
            fire: "[223-246]",
            earth: "[247-355]"
        };
        return isMini ? rules2[choice] : rules[choice];
    }

    public static getSettleResult(total: number, miniType = false) {
        const normalRules = {
            big: 810,
            gold: 696,
            wood: 764,
            water: 856,
            fire: 924
        };

        const miniRules = {
            big: 205,
            gold: 164,
            wood: 188,
            water: 223,
            fire: 247
        };

        const rules = miniType ? miniRules : normalRules;

        const settle: any = {};
        if (total > rules.big) {
            settle.big = true;
        } else {
            settle.small = true;
        }

        if (total % 2 === 1) {
            settle.odd = true;
        } else {
            settle.even = true;
        }

        if (total < rules.gold) {
            settle.gold = true;
        } else if (total < rules.wood) {
            settle.wood = true;
        } else if (total < rules.water) {
            settle.water = true;
        } else if (total < rules.fire) {
            settle.fire = true;
        } else {
            settle.earth = true;
        }
        return settle;
    }

    public static getKenoName(kenoType: KenoType): string {
        const id = KenoUtils.getKenoGameId(kenoType);
        return GameUtils.getGameNameString(id);
    }

    public static getKenoGameId(kenoType: KenoType): number {
        const dict = {
            Mega: MegaKenoId,
            Mega2: MegaKeno2Id,
            Mini: KenoMiniId,
            Mini2: KenoMini2Id,
            East: KenoEastId,
            West: KenoWestId,
            South: KenoSouthId,
            North: KenoNorthId
        };
        return dict[KenoType[kenoType]];
    }
}
