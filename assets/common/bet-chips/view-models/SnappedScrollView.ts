const { ccclass, property } = cc._decorator;

@ccclass
export default class SnappedScrollView extends cc.Component {
    @property
    itemSize = 85;

    @property
    spacing = 8;

    @property
    enableHalfSpacing = true;

    @property
    isHorizontalLayout = true;

    public onScrollEnded = () => {};

    private readonly calculatedPercent: number[] = [];
    private minDisplayIndex = 0;

    private _scroll: cc.ScrollView;
    get scroll() {
        if (!this._scroll) {
            this._scroll = this.getComponent(cc.ScrollView);
        }
        return this._scroll;
    }
    private scrollBegan = false;

    scrollContentWidth() {
        const count = this.contentItemCount();
        return this.isHorizontalLayout ? count * this.itemSize + (count + 1) * this.spacing : this.scroll.content.width;
    }

    contentItemCount() {
        return this.isHorizontalLayout
            ? this.scroll.content.childrenCount
            : Math.round(this.scroll.content.width / (this.itemSize + this.spacing));
    }

    initCalculatedPercent() {
        const count = this.contentItemCount();
        const contentWidth = this.scrollContentWidth();
        const maxOffset = contentWidth - this.scroll.node.width;
        const haftSpacing = this.spacing / 2;
        for (let i = 0; i < count; i++) {
            let offset = (this.itemSize + this.spacing) * i + (this.enableHalfSpacing ? haftSpacing : 0);
            if (offset > maxOffset) {
                offset = maxOffset;
            }

            const percent = offset / maxOffset;
            this.calculatedPercent.push(percent);
        }
    }

    start() {
        this.initCalculatedPercent();
    }

    onScroll(scroll: cc.ScrollView, eventType) {
        if (eventType === cc.ScrollView.EventType.SCROLL_ENDED) {
            if (!this.scrollBegan) {
                return;
            }
            this.scrollBegan = false;
            const percent = this.getPercent();
            this.calculateMinDisplayIndex(percent);
            this.scrollTo(this.minDisplayIndex);
            this.onScrollEnded();
        }
        if (eventType === cc.ScrollView.EventType.SCROLL_BEGAN) {
            this.scrollBegan = true;
        }
    }

    calculateMinDisplayIndex(percent: number) {
        for (let i = 0; i < this.calculatedPercent.length; i++) {
            if (this.calculatedPercent[i] <= percent && percent <= this.calculatedPercent[i + 1]) {
                const delta1 = percent - this.calculatedPercent[i];
                const delta2 = this.calculatedPercent[i + 1] - percent;
                if (delta1 + delta2 > 0) {
                    this.minDisplayIndex = delta1 < delta2 ? i : i + 1;
                }
                break;
            }

            if (percent <= this.calculatedPercent[i]) {
                this.minDisplayIndex = i;
                break;
            }
            if (this.calculatedPercent[i] >= 1) {
                break;
            }
        }
    }

    scrollTo(index: number) {
        this.minDisplayIndex = index;
        this.scroll.scrollToPercentHorizontal(this.calculatedPercent[index], 0.3);
    }

    getPercent(): number {
        const offset = -this.scroll.getScrollOffset().x;
        if (offset < 0) {
            return 0;
        }
        const percent = offset / this.scroll.getMaxScrollOffset().x;
        if (percent > 1) {
            return 1;
        }
        return percent;
    }

    getMinDisplayIndex(): number {
        return this.minDisplayIndex;
    }
}
