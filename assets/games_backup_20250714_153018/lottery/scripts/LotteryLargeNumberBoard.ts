import LotteryNumberBoard from "./LotteryNumberBoard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryLargeNumberBoard extends LotteryNumberBoard {
    @property(cc.PageView)
    pageView: cc.PageView = null;

    initItems() {
        for (let i = 0; i < 100; i++) {
            const index = i < 50 ? 0 : 1;
            const content = this.pageView.content.children[index];
            this.addItem(content, i);
        }
    }

    resetScrolling() {
        this.pageView.scrollToPage(0, 0);
    }

    scrollToRight() {
        this.pageView.scrollToPage(1, 0.3);
    }

    scrollToLeft() {
        this.pageView.scrollToPage(0, 0.3);
    }
}
