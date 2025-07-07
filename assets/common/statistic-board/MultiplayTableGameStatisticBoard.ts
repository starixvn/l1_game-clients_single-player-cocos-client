import AudioManager from "../audio/AudioManager";
import SnappedScrollView from "../bet-chips/view-models/SnappedScrollView";
import MultiplayGameStatisticBoard from "./MultiplayGameStatisticBoard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplayTableGameStatisticBoard extends MultiplayGameStatisticBoard {
    @property(SnappedScrollView)
    snappedScrollView: SnappedScrollView = null;

    @property(cc.Node)
    prevButton: cc.Node = null;

    @property(cc.Node)
    nextButton: cc.Node = null;

    @property([cc.Node])
    pageIndicator: cc.Node[] = [];

    @property
    movingStep = 1;

    private selectedIndex = 0;

    onLoad() {
        super.onLoad();
        this.prevButton.active = false;
        this.snappedScrollView.onScrollEnded = () => {
            const min = this.snappedScrollView.getMinDisplayIndex();
            this.selectedIndex = min;
            this.updateArrowVisibility();
            this.updatePageIndicator();
        };
    }

    public onPrevious() {
        AudioManager.getInstance().playClick();
        this.selectedIndex -= this.movingStep;
        this.scrollToSelectedIndex();
    }

    public onNext() {
        AudioManager.getInstance().playClick();
        this.selectedIndex += this.movingStep;
        this.scrollToSelectedIndex();
    }

    private scrollToSelectedIndex() {
        this.snappedScrollView.scrollTo(this.selectedIndex);
        this.updateArrowVisibility();
        this.updatePageIndicator();
    }

    private updateArrowVisibility() {
        this.prevButton.active = true;
        this.nextButton.active = true;
        if (this.selectedIndex <= 0) {
            this.selectedIndex = 0;
            this.prevButton.active = false;
        } else {
            this.nextButton.active = false;
        }
    }

    updatePageIndicator() {
        this.pageIndicator[this.selectedIndex].getComponent(cc.Toggle).isChecked = true;
    }

    onPageIndicatorClick(e) {
        const clickIndex = this.pageIndicator.findIndex((page) => page === e.target);
        this.selectedIndex = clickIndex;
        this.scrollToSelectedIndex();
    }
}
