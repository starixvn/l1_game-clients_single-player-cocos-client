export default class DragonTigerUtil {
    public static getWinItem(settlementResult: any): number {
        const dict = ["dragon", "tiger", "tie"];
        for (let i = 0; i < dict.length; i++) {
            if (settlementResult[dict[i]]) {
                return i;
            }
        }
        return -1;
    }
}
