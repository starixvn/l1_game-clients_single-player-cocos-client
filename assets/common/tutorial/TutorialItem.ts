const { ccclass } = cc._decorator;

@ccclass
export default class TutorialItem extends cc.Component {
    public displayTime = 1;
    protected pageTransitionTime = 0.3;
    protected itemTransitionTime = 0.3;

    callback = {
        next: () => {
            // next
        },
        previous: () => {
            //previous
        }
    };

    onClickNext() {
        this.callback.next();
    }

    onClickPrevious() {
        this.callback.previous();
    }

    showGuidePage() {
        this.node.active = true;
        this.node.opacity = 0;
        cc.tween(this.node).to(this.pageTransitionTime, { opacity: 255 }).start();
    }

    hide() {
        cc.tween(this.node)
            .to(this.pageTransitionTime, { opacity: 0 })
            .call(() => {
                this.node.active = false;
                this.onHidden();
            })
            .start();
    }

    onHidden() {
        //onHidden
    }

    showOpacity(node: cc.Node) {
        cc.tween(node).to(this.itemTransitionTime, { opacity: 255 }, { easing: "easeIn" }).start();
    }

    getParentNode() {
        return this.node.parent.parent;
    }
}
