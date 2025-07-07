import * as i18n from "i18n/runtime-scripts/LanguageData";

export default class VipSedieWarUtils {
    public static getBetChoiceString(choice: string): string {
        const dict = {
            even: "total_even",
            odd: "total_odd",

            player: "choice_player",
            banker: "choice_banker",

            playerEven: "choice_player_even",
            playerOdd: "choice_player_odd",

            bankerEven: "choice_banker_even",
            bankerOdd: "choice_banker_odd",

            tie: "choice_tie",
            playerRed3: "choice_player_red3",
            playerRed4: "choice_player_red4",
            playerWhite3: "choice_player_white3",
            playerWhite4: "choice_player_white4",

            bankerRed3: "choice_banker_red3",
            bankerRed4: "choice_banker_red4",
            bankerWhite3: "choice_banker_white3",
            bankerWhite4: "choice_banker_white4"
        };

        return i18n.t(`ui.${dict[choice]}`);
    }

    public static setDotsImage(result: any, playerResultNode: cc.Node, bankerResultNode: cc.Node, dotsFrame: cc.SpriteFrame[]) {
        const playerSprites = this.getSpriteFrame(playerResultNode, dotsFrame);
        let index = 0;
        Object.keys(result.player).forEach((key) => {
            if (result.player[key]) {
                playerSprites[index].getComponent(cc.Sprite).spriteFrame = dotsFrame[1];
                index++;
            }
        });
        const bankerSprites = this.getSpriteFrame(bankerResultNode, dotsFrame);
        index = 0;
        Object.keys(result.banker).forEach((key) => {
            if (result.banker[key]) {
                bankerSprites[index].getComponent(cc.Sprite).spriteFrame = dotsFrame[1];
                index++;
            }
        });
    }

    public static getSpriteFrame(node, dotsFrame) {
        return node.children.map((child) => {
            const sprite = child.getComponent(cc.Sprite);
            sprite.spriteFrame = dotsFrame[0];
            return sprite;
        });
    }
}
