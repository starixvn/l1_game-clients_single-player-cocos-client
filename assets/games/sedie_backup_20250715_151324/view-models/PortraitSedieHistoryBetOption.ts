import * as i18n from "i18n/runtime-scripts/LanguageData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PortraitSedieHistoryBetOption extends cc.Component {
    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    stake: cc.Label = null;

    private convertChoiceData(choice: string): string {
        let betChoice = "";
        const choiceData = ["even", "odd", "red2", "red3", "red4", "white3", "white4"];
        const choiceStr = ["choice_even", "choice_odd", "choice_red2", "choice_red3", "choice_red4", "choice_white3", "choice_white4"];
        choiceData.forEach((item, index) => {
            if (choice === item) {
                betChoice = choiceStr[index];
            }
        });
        return betChoice;
    }

    handleBetOptionItem(choice: string, odd: string, stake: string) {
        const choiceStr = `ui.${this.convertChoiceData(choice)}`;
        this.choice.string = `${i18n.t(choiceStr)} @ ${odd}`;
        this.stake.string = stake;
    }

    highlightForWinning(win: boolean) {
        const color = win ? cc.Color.YELLOW : cc.Color.WHITE;
        this.choice.node.color = color;
        this.stake.node.color = color;
    }
}
