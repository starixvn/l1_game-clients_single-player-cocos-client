export default class MockedGameUtils {
    public static getBetChoiceString(params) {
        return params;
    }

    public static getText(key, opt = {}) {
        return key;
    }

    public static createNodeFromPrefab() {}

    public static getChipValues(bet: number, options: number[]): any {
        const chipValue = {
            values: {
                "1": 1,
                "5": 0,
                "10": 0,
                "50": 0,
                "100": 0,
                "200": 0,
                "500": 0,
                "1000": 0,
                "2000": 0
            },
            chipTotal: 1
        };
        return chipValue.values;
    }

    public static getValueByCurrency(value: number, otherRate?: number): number {
        if (!otherRate) {
            otherRate = 1;
        }

        const userRate = 1;

        return (value * otherRate) / userRate;
    }

    public static getTicketValueByCurrency(value: number, userRate?: number, otherRate?: number): number {
        if (!otherRate) {
            otherRate = 1;
        }

        if (!userRate) {
            userRate = 1;
        }
        return (value * otherRate) / userRate;
    }

    public static setFontSizeLabelsInNode(node: cc.Node, isCustom = false, fontSize = 36) {}

    public static getValueByExchangeRateCode(value: number, exchangeRateCode) {
        return value;
    }

    public static getGameNameString(gameId): string {
        return `gameNames.${gameId}`;
    }

    public static getAvatarSprite(avatarId: number) {
        return null;
    }

    public static floatToNumber(opt: {
        label: cc.Label;
        amount: number;
        duration: number;
        start?: number;
        noZeroSuffix?: boolean;
        prefixStr?: string;
    }) {}

    public static loadResource(path: string): Promise<cc.Prefab> {
        return null;
    }
}
