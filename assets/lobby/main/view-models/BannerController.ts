import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../../analytics/AnalyticsManager";
import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import BannerItem from "./BannerItem";

const { ccclass, property } = cc._decorator;

enum PageDirection {
    Left,
    Right
}

@ccclass
export default class BannerController extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property
    intervalChangeImage = 4;

    protected dragThreshold = 0.25;
    public currentIndex = 0;
    private touchOffset = cc.v2(0, 0);
    private started = false;
    private isScrollNestedScrollView = false;
    public menuLoop = false;
    public onEndingRound = (rightDirection: boolean) => {
        // handle
    };

    onLoad() {
        this.enableTouch();
        uiManager.emitterListener(
            InternalEvents.SCROLL_NESTED_SCROLLVIEW,
            (isScroll) => {
                this.isScrollNestedScrollView = isScroll;
                this.triggerAutoChange();
                this.started = !isScroll;
            },
            this
        );
    }

    enableTouch() {
        this.content.on(cc.Node.EventType.TOUCH_START, this.eventStart, this, true);
        this.content.on(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this, true);
        this.content.on(cc.Node.EventType.TOUCH_END, this.eventEnd, this, true);
        this.content.on(cc.Node.EventType.TOUCH_CANCEL, this.handleReleaseTouch, this, true);
    }

    onEnable() {
        this.started = false;
    }

    showFirstPage() {
        this.animationMovePage(0, PageDirection.Right);
    }

    showLastPage() {
        this.animationMovePage(this.content?.childrenCount - 1, PageDirection.Left);
    }

    onDisable() {
        this.clearAutoChange();

        const distance = this.node.width * 1.3;
        this.content?.children?.forEach((child) => {
            child.active = false;
            child.position = cc.v3(distance, 0);
            child.stopAllActions();
        });
    }

    onDestroy() {
        this.clearAutoChange();
        if (cc.sys.isMobile) {
            this.content.off(cc.Node.EventType.TOUCH_START, this.eventStart, this, true);
            this.content.off(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this, true);
            this.content.off(cc.Node.EventType.TOUCH_END, this.eventEnd, this, true);
            this.content.off(cc.Node.EventType.TOUCH_CANCEL, this.handleReleaseTouch, this, true);
        } else {
            this.content.off(cc.Node.EventType.MOUSE_DOWN, this.eventStart, this, true);
            this.content.off(cc.Node.EventType.MOUSE_MOVE, this.eventMove, this, true);
            this.content.off(cc.Node.EventType.TOUCH_END, this.eventEnd, this, true);
            this.content.off(cc.Node.EventType.MOUSE_LEAVE, this.handleReleaseTouch, this, true);
        }
    }

    handleReleaseTouch(e) {
        if (!this.started) {
            return;
        }
        this.started = false;
        const node = this.getCurrentPage();
        const location = e.getLocation();
        const delta = location.x - this.touchOffset.x;
        if (Math.abs(delta) >= this.node.width * this.dragThreshold) {
            if (delta > 0) {
                this.showPreviouPage();
            } else {
                this.showNextPage();
            }
        } else {
            this.clearAutoChange();
            this.moveToCenter(node, 0.3);
        }
    }

    eventEnd(e) {
        this.handleReleaseTouch(e);
        const location = e.getLocation();
        const delta = location.x - this.touchOffset.x;
        if (Math.abs(delta) > 10) {
            e.stopPropagation();
        }
    }

    eventMove(e) {
        if (!this.started) {
            return;
        }

        const location = e.getLocation();
        const delta = location.x - this.touchOffset.x;
        if (Math.abs(delta) >= this.node.width * this.dragThreshold) {
            if (delta > 0) {
                this.showPreviouPage();
            } else {
                this.showNextPage();
            }
        } else {
            const node = this.getCurrentPage();
            node.position = cc.v3(delta, node.position.y);
        }
    }

    eventStart(e) {
        this.started = true;
        const location = e.getLocation();
        this.touchOffset = cc.v2(location.x, location.y);
    }

    getCurrentPage(): cc.Node {
        return this.content?.children[this.currentIndex] || null;
    }

    autoChange() {
        if (this.isScrollNestedScrollView) {
            return;
        }
        this.showNextPage();
    }

    showNextPage() {
        this.animationMovePage(this.currentIndex + 1, PageDirection.Right);
    }

    showPreviouPage() {
        this.animationMovePage(this.currentIndex - 1, PageDirection.Left);
    }

    animationMovePage(pageIndex: number, direction: PageDirection) {
        this.clearAutoChange();

        const oldPage = this.getCurrentPage();
        this.currentIndex = pageIndex;
        if (direction === PageDirection.Right) {
            this.showPageRightDirection(oldPage);
        } else {
            this.showPageLeftDirection(oldPage);
        }
    }

    showPageRightDirection(currentPage: cc.Node) {
        if (this.currentIndex >= this.content?.childrenCount) {
            if (!this.menuLoop) {
                this.currentIndex = this.content?.childrenCount - 1;
                this.onEndingRound(true);
                return;
            } else {
                this.currentIndex = 0;
            }
        }

        this.showPage(currentPage, this.currentIndex, PageDirection.Right);
    }

    showPageLeftDirection(currentPage: cc.Node) {
        if (this.currentIndex < 0) {
            if (!this.menuLoop) {
                this.currentIndex = 0;
                this.onEndingRound(false);
                return;
            } else {
                this.currentIndex = this.content?.childrenCount - 1;
            }
        }

        this.showPage(currentPage, this.currentIndex, PageDirection.Left);
    }

    showPage(oldNode: cc.Node, index: number, pageDirection: PageDirection = PageDirection.Right) {
        try {
            this.started = false;
            const direction = pageDirection === PageDirection.Right ? 1 : -1;
            const distance = this.node.width * 1.3;

            if (oldNode) {
                oldNode.stopAllActions();
                cc.tween(oldNode)
                    .to(0.3, { position: cc.v2(-direction * distance, 0) })
                    .call(() => {
                        oldNode.active = false;
                    })
                    .start();
            }

            const currentNode = this.content?.children[index];
            if (currentNode) {
                currentNode.active = true;
                currentNode.position = cc.v3(direction * distance, currentNode.position.y);

                this.intervalChangeImage = currentNode.getComponent(BannerItem).displayTime;

                this.moveToCenter(currentNode, 0.6);
            }
        } catch (error) {
            cc.log("An error occurred in showPage for Banner");
        }
    }

    moveToCenter(node: cc.Node, duration: number) {
        node?.stopAllActions();
        cc.tween(node)
            .to(duration, { position: cc.v2(0, 0) }, { easing: "cubicInOut" })
            .call(() => {
                this.scheduleOnce(this.autoChange, this.intervalChangeImage);
            })
            .start();
    }

    openGame(e, gameId) {
        AudioManager.getInstance().playClick();
        appManager.isDirectMode = false;
        GameUtils.clearGameSetting(gameId);
        GameUtils.unCacheAndHideGameLoading(uiManager.getCurrentGameId());
        GameUtils.openGame(+gameId, appManager.miniPanel, null, true);
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: "Banner"
        });
    }

    triggerAutoChange() {
        if (!this.isScrollNestedScrollView) {
            this.clearAutoChange();
            this.scheduleOnce(this.autoChange, this.intervalChangeImage);
        }
    }

    clearAutoChange() {
        this.unschedule(this.autoChange);
    }
}
