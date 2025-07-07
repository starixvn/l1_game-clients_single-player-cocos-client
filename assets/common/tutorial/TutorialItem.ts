const { ccclass } = cc._decorator;

@ccclass
export default class TutorialItem extends cc.Component {
    public displayTime = 1;
    protected readonly transitionTime = 0.3;

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

    show() {
        this.node.active = true;
        this.node.opacity = 0;
        cc.tween(this.node).to(this.transitionTime, { opacity: 255 }).start();
    }

    hide() {
        cc.tween(this.node)
            .to(this.transitionTime, { opacity: 0 })
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
        cc.tween(node).to(this.transitionTime, { opacity: 255 }).start();
    }

    getParentNode() {
        return this.node.parent.parent.parent;
    }
}
