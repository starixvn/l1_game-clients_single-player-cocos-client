import BetChips from "../../../common/bet-chips/view-models/BetChips";
import GameUtils from "../../../common/GameUtils";
import HiLoBetChipItem from "./HiLoBetChipItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoBetBoard extends BetChips {
    @property(cc.Node)
    disableLayer: cc.Node = null;

    @property(cc.Prefab)
    numberBetPrefab: cc.Prefab = null;

    disableBetBoard(status: boolean) {
        this.disableLayer.active = status;
        this.setDisabledBetChips(status);
        this.disablePrevNextButtons(status);
    }

    createChipNode(value: number): cc.Node {
        const node = GameUtils.createNodeFromPrefab(this.numberBetPrefab);
        node.getComponent(HiLoBetChipItem).renderBetChipItem(value);
        return node;
    }

    updateSelectedBet(targetName: string) {
        this.chips.children.forEach((chip) => {
            const isSelected = targetName === chip.name;
            chip.getComponent(HiLoBetChipItem).setSelectedBg(isSelected);
        });
    }

    highlightChip(chip: cc.Node, highlight: boolean) {
        chip.getComponent(HiLoBetChipItem).setSelectedBg(highlight);
    }

    disablePrevNextButtons(status: boolean) {
        this.setLeftButtonStatus(!status);
        this.setRightButtonStatus(!status);

        if (this.selectedIndex <= 0) {
            this.setLeftButtonStatus(false);
        }
    }
}
