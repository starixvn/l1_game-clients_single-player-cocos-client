import PopupMinigames from "./PopupMinigames";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupMiniGamesTheme extends PopupMinigames {
    @property(cc.Node)
    highlightIcon: cc.Node = null;

    onLoad(): void {
        this.handleHighlightIcon(true);
        super.onLoad();
    }

    showListGame() {
        this.handleHighlightIcon(false);
        super.showListGame();
    }

    hideListGame() {
        super.hideListGame();
        cc.tween(this.node)
            .delay(this.durationBackToPrePosition)
            .call(() => {
                this.handleHighlightIcon(true);
            })
            .start();
    }

    handleHighlightIcon(status: boolean) {
        this.highlightIcon && (this.highlightIcon.active = status);
    }
}
