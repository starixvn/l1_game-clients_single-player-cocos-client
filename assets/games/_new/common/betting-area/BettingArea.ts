import GameUtils from "../../../../common/GameUtils";
import { formatOdds, numberWithCommas } from "../../../../common/helpers/NumberHelper";
import BettingAreaTheme from "./BettingAreaTheme";

const { ccclass, property, menu } = cc._decorator;
export const BettingAreaEvents = {
    PLACING_BET: "PLACING BET"
};

@ccclass
@menu("Common/BettingArea/BettingArea")
export default class BettingArea extends cc.Component {
    private currentTheme = 0;

    @property(cc.Label)
    totalBetsLabel: cc.Label = null;

    @property(cc.Label)
    protected ownBetsLabel: cc.Label = null;

    @property(cc.Label)
    protected oddsLabel: cc.Label = null;

    @property()
    get theme() {
        return this.currentTheme || 0;
    }

    set theme(value: number) {
        if (this.currentTheme === value) {
            return;
        }

        if (value >= 0 && value < this.themes.length) {
            this.currentTheme = value;

            this.themes.forEach((theme, index) => {
                theme.active = index === value;
            });
        } else {
            this.theme = 0;
        }
    }

    @property({ type: [cc.Component] })
    protected themes: BettingAreaTheme[] = [];

    set totalBets(value: number) {
        if (this.totalBetsLabel) {
            const convertedTotalBet = GameUtils.getValueByCurrency(value);
            this.totalBetsLabel.string = numberWithCommas(convertedTotalBet);
        }
    }

    set ownBets(value: number) {
        if (this.ownBetsLabel) {
            this.ownBetsLabel.string = numberWithCommas(value);
        }
    }

    set odds(value: number) {
        if (this.oddsLabel) {
            this.oddsLabel.string = formatOdds(value);
        }
    }
}
