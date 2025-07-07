import BetChips from "../../../common/bet-chips/view-models/BetChips";
import GameUtils from "../../../common/GameUtils";
import { RouletteBetInfo } from "./Roulette";
import { RouletteBetType } from "./RouletteCommon";

export default class RouletteUtils {
    private static readonly redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

    public static isRed(number): boolean {
        return this.redNumbers.indexOf(number) !== -1;
    }

    public static isOdd(number): boolean {
        return number % 2 !== 0;
    }

    public static isBig(number): boolean {
        return number > 18;
    }

    public static getKey(betInfo: RouletteBetInfo): string {
        let key = betInfo.numbers.join("-");
        switch (betInfo.type) {
            case RouletteBetType.Column:
                key = betInfo.numbers[0].toString();
                break;
            case RouletteBetType.Dozen:
                const index = Math.floor(betInfo.numbers[11] / 10) || betInfo.numbers[0];
                key = index.toString();
                break;
            case RouletteBetType.OddEven:
                key = RouletteUtils.isOdd(betInfo.numbers[0]) ? "odd" : "even";
                break;
            case RouletteBetType.RedBlack:
                key = RouletteUtils.isRed(betInfo.numbers[0]) ? "red" : "black";
                break;
            case RouletteBetType.BigSmall:
                key = RouletteUtils.isBig(betInfo.numbers[0]) ? "big" : "small";
                break;
            default:
                break;
        }

        return key;
    }

    public static parseKeyToNumbers(key: string): number[] {
        return key.split("-").map((i) => +i);
    }

    public static createQuickBetChoices(type: string, bet: number): any {
        const options = {
            zero: {
                split: {
                    "0-3": bet,
                    "12-15": bet,
                    "32-35": bet
                },
                straightUp: {
                    "26": bet
                }
            },
            voisins: {
                split: {
                    "18-21": bet,
                    "12-15": bet,
                    "32-35": bet,
                    "19-22": bet,
                    "4-7": bet
                },
                triangle: {
                    "0-2-3": bet * 2
                },
                corner: {
                    "25-26-28-29": bet * 2
                }
            },
            tiers: {
                split: {
                    "5-8": bet,
                    "10-11": bet,
                    "13-16": bet,
                    "23-24": bet,
                    "27-30": bet,
                    "33-36": bet
                }
            },
            orphelins: {
                split: {
                    "6-9": bet,
                    "14-17": bet,
                    "17-20": bet,
                    "31-34": bet
                },
                straightUp: {
                    "1": bet
                }
            }
        };
        return options[type];
    }

    public static createChip(bet: number, betChip: BetChips, highlight = false): cc.Node {
        const chip = betChip.createSmallChip(bet);

        if (highlight) {
            const highlightNode = new cc.Node();
            highlightNode.addComponent(cc.Sprite).spriteFrame = betChip.chipAltas.getSpriteFrame("highlight_not_confirm");
            highlightNode.scale = 0.8;
            chip.addChild(highlightNode);
        }
        return chip;
    }

    public static getChipValues(bet: number, options: number[]): any {
        return GameUtils.getChipValues(bet, options);
    }

    public static createChips(bet: number, betChip: BetChips, highlight = false): cc.Node {
        const values = GameUtils.getChipQuantity(bet, betChip.chipValues);
        const keys = Object.keys(values).sort((a, b) => +a - +b); // sort ascending by key
        const key = keys.find((k) => values[k] > 0);
        return this.createChip(+key, betChip, highlight);
    }
}
