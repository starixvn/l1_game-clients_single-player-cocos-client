import HoverItemBase from "../HoverItemBase";
import NewButton from "./NewButton";

const { ccclass } = cc._decorator;

@ccclass
export default class ButtonGroup extends HoverItemBase {
    buttons: NewButton[] = [];

    private _interactable = true;

    onLoad() {
        super.onLoad();
        this.node.children.forEach((child) => {
            const newButton = child.getComponent(NewButton);
            newButton && this.buttons.push(newButton);
        });
    }

    onTouchMove(e) {
        let selected = false;
        for (let i = this.buttons.length - 1; i >= 0; i--) {
            const button = this.buttons[i];
            if (button.node.active && button.checkCollider(e) && !selected) {
                selected = true;
                button.setHighlight(true);
            } else {
                button.setHighlight(false);
            }
        }
    }

    onTouchEnd(e) {
        if (!this._interactable) {
            return;
        }

        for (let i = this.buttons.length - 1; i >= 0; i--) {
            const button = this.buttons[i];
            if (button.node.active && button.checkCollider(e)) {
                button.callback.selected();
                this._interactable = false;
                cc.tween(this.node)
                    .delay(1)
                    .call(() => (this._interactable = true))
                    .start();
                break;
            }
        }
    }

    onTouchCancel(e) {
        this.buttons.forEach((button) => button.setHighlight(false));
    }
}
