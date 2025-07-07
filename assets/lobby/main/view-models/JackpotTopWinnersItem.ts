import GameUtils from "../../../common/GameUtils";
import { shortenName } from "../../../common/helpers/NicknameHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { userManager } from "../../../common/user/UserManager";
import BannerJackpot from "./BannerJackpot";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotTopWinnersItem extends BannerJackpot {
    @property(cc.Sprite)
    image: cc.Sprite = null;

    @property(cc.Label)
    playerName: cc.Label = null;

    @property(cc.Label)
    amount: cc.Label = null;

    @property(cc.Label)
    gameName: cc.Label = null;

    async setData(data) {
        const { avatarId, winnerName, amount, gameId, exchangeRateCode } = data;
        this.gameId = gameId;
        this.setName(winnerName);
        this.setAmount(GameUtils.getValueByExchangeRateCode(amount, exchangeRateCode));
        this.setGameName(GameUtils.getGameNameString(gameId));
        await GameUtils.asyncExecute(this?.node, this.setAvatar(avatarId));
    }

    async setAvatar(id: number) {
        if (this?.image) {
            this.image.spriteFrame = await GameUtils.asyncExecute(this?.node, GameUtils.getAvatarSprite(id));
        }
    }

    private setName(name: string) {
        this.playerName.string = userManager.isLoginUser(name) ? name : shortenName(name);
    }

    private setAmount(amount: number) {
        this.amount.string = numberWithCommas(amount, 2, false);
    }

    private setGameName(gameName: string) {
        gameName = gameName.length > 16 ? `${gameName.slice(0, 13)}...` : gameName;
        this.gameName.string = gameName;
    }
}
