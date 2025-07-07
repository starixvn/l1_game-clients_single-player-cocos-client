const { ccclass } = cc._decorator;

export enum CrossControlAction {
    Click = "cross-control-click"
}

@ccclass
export class CrossControlItem extends cc.Component {
    private _canvas: cc.Node = null;
    get canvas(): cc.Node {
        if (!this._canvas) {
            this._canvas = cc.director.getScene().getChildByName("Canvas");
        }

        return this._canvas;
    }

    listener: any;
    onLoad() {
        this.node.on("click", this.onClick, this);
    }

    onDestroy() {
        this.node.off("click", this.onClick, this);
        this.listener && this.removeListener();
    }

    onClick() {
        if (this.canvas) {
            this.canvas.emit(CrossControlAction.Click, this.node.uuid);
        }
    }

    registerListenerOtherControls(callback: (nodeId: string) => void) {
        this.listener = (nodeId: string) => {
            if (this.node.uuid !== nodeId) {
                callback(nodeId);
            }
        };
        this.canvas.on(CrossControlAction.Click, this.listener);
    }

    removeListener() {
        this.canvas.off(CrossControlAction.Click, this.listener);
    }
}
