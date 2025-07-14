import { LotteryChoiceItem } from "./LotteryChoiceItem";

const { ccclass } = cc._decorator;

@ccclass
export abstract class LotteryChoicesBoard extends cc.Component {
    public items: LotteryChoiceItem[] = [];
    protected highlighted = false;
    protected showedOwnBet = false;
    onChoiceBet = (name: string) => {};

    resetBoard() {}

    resetScrolling() {}

    initCallbackForItems() {
        this.items.forEach((item) => {
            item.onChoiceBet = (name: string) => {
                this.onChoiceBet(name);
            };
        });
    }

    hideStatistics() {
        this.items.forEach((item) => item.hideStatistics());
    }

    showHighlight(highlight: boolean) {
        this.highlighted = highlight;
    }

    setHighlightResult(values: string[]) {
        if (this.highlighted) {
            this.items.forEach((item) => {
                item.setHighlight(values.findIndex((value) => value === item.node.name) !== -1);
            });
        }
    }

    getChipLocation(choiceName: string) {
        const item = this.items.find((item) => item.node.name === choiceName);
        return item ? item.chipLocation : null;
    }

    clearHighlight() {
        this.highlighted = false;
        this.items.forEach((item) => item.setHighlight(false));
    }

    clearOwnBet() {
        this.items.forEach((item) => item.clearOwnBet());
    }

    setOwnBet(values: any) {
        this.clearOwnBet();
        Object.keys(values).forEach((key) => {
            const value = values[key];
            if (value === 0) {
                return;
            }
            if (key.includes("-")) {
                const separated = key.split("-");
                separated.forEach((eachKey) => {
                    const item = this.items.find((i) => i.node.name === eachKey);
                    if (item) {
                        item.markOwnBet();
                    }
                });
            } else {
                const item = this.items.find((i) => i.node.name === key);
                if (item) {
                    item.setOwnBet(value);
                }
            }
        });
    }
}
