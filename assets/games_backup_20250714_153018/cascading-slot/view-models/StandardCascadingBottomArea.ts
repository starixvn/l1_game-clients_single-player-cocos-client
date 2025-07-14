import ChangeNodeColor from "../../../common/ChangeNodeColor";
import GameUtils from "../../../common/GameUtils";
import CascadingTotalBet from "./CascadingTotalBet";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingBottomArea extends cc.Component {
    @property(cc.Toggle)
    autoSpinToggle: cc.Toggle = null;

    @property(cc.Toggle)
    turboToggle: cc.Toggle = null;

    @property(cc.Label)
    totalWinLabel: cc.Label = null;

    @property(cc.Node)
    totalWinNode: cc.Node = null;

    miniBetControl: CascadingTotalBet;

    initTotalBet(node: cc.Node) {
        this.miniBetControl = node.getComponent(CascadingTotalBet);
    }

    onClickListener = {
        onAutoSpinChanged: () => {},
        onTurboModeChanged: (toggle) => {}
    };

    onAutoSpinChanged() {
        this.onClickListener.onAutoSpinChanged();
    }

    onTurboModeChanged(toggle: cc.Toggle) {
        this.onClickListener.onTurboModeChanged(toggle);
    }

    updateColor(colorList) {
        const { textColor, numberColor, buttonBorderColor, winAmountColor, bgFrameColor } = colorList;

        this.getComponentsInChildren(ChangeNodeColor).forEach((comp) => {
            const labelComp = comp.node.getComponent(cc.Label);
            if (labelComp) {
                comp.updateColor(comp.node.getComponent("LocalizedLabel") ? textColor : numberColor);
            } else {
                comp.updateColor(buttonBorderColor);
            }
        });

        this.totalWinLabel.node.color = cc.Color.WHITE.fromHEX(winAmountColor);
        GameUtils.setColorAndOpacity(bgFrameColor, this.totalWinNode);
        GameUtils.setColorAndOpacity(bgFrameColor, this.autoSpinToggle.node.children[0]);
        GameUtils.setColorAndOpacity(bgFrameColor, this.turboToggle.node.children[0]);
    }
}
