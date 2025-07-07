import AudioManager from "./audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PageScrollButton extends cc.Component {
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;

    @property(cc.Node)
    arrowNode: cc.Node = null;

    onLoad() {
        this.initScrollListener();
    }

    initScrollListener() {
        this.scroll.content.on(cc.Node.EventType.SIZE_CHANGED, this.updateArrowVisibility.bind(this));
        this.scroll.node.on("scroll-ended", () => {
            const offset = Math.abs(Math.floor(this.scroll.getScrollOffset().x));
            const maxOffset = Math.floor(this.scroll.getMaxScrollOffset().x);

            if (offset <= 1 || offset >= maxOffset) {
                const right = offset < maxOffset;
                this.arrowNode.scale = right ? 1 : -1;
            }
        });
    }

    updateArrowVisibility() {
        const scrollable = this.scroll.content.width > this.scroll.node.width;
        this.arrowNode.parent.active = scrollable;
        this.arrowNode.scale = 1;
    }
    onFastScrollClick() {
        AudioManager.getInstance().playClick();

        if (this.scroll.content.childrenCount === 0) {
            return;
        }

        const offset = Math.abs(this.scroll.getScrollOffset().x);
        const maxOffset = Math.abs(this.scroll.getMaxScrollOffset().x);
        const direction = this.arrowNode.scaleX;
        const delta = this.scroll.node.width;
        let newOffset = offset + direction * delta;

        const layout = this.scroll.content.getComponent(cc.Layout);
        const paddingLeft = layout.paddingLeft;
        const paddingRight = layout.paddingRight;
        const spacing = layout.spacingX;
        const itemSize = this.scroll.content.children[0].width;
        const stepWidth = itemSize + spacing;

        if (direction > 0) {
            const stepCount = Math.floor((newOffset - paddingLeft) / stepWidth);
            newOffset = paddingLeft + stepCount * stepWidth;
        } else {
            const stepCount = Math.floor((maxOffset - paddingRight - newOffset) / stepWidth);
            newOffset = maxOffset - stepCount * stepWidth;
        }

        this.scroll.scrollToOffset(cc.v2(newOffset, 0), 0.4);
    }
}
