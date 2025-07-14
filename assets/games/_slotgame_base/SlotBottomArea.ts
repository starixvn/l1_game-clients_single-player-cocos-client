import ChangeNodeColor from "../../common/ChangeNodeColor";
import BetLevelsContainer from "./bet-levels/BetLevelsContainer";

const { ccclass, property } = cc._decorator;

interface BottomAreaDefinedColor {
    textColor: string;
    numberColor: string;
    buttonBorderColor: string;
    winAmountColor: string;
}

@ccclass
export default class SlotBottomArea extends cc.Component {
    @property(cc.Toggle)
    autoSpinToggle: cc.Toggle = null;

    @property(cc.Toggle)
    turboToggle: cc.Toggle = null;

    @property(cc.Button)
    stakeButton: cc.Button = null;

    @property(cc.Button)
    lineButton: cc.Button = null;

    @property(cc.Label)
    stakeLabel: cc.Label = null;

    @property(cc.Label)
    lineLabel: cc.Label = null;

    @property(cc.Label)
    totalBet: cc.Label = null;

    @property(cc.Label)
    winningBet: cc.Label = null;

    @property(cc.Node)
    winningBetEffect: cc.Node = null;

    @property(cc.Node)
    betLevelsContainerNode: cc.Node = null;

    @property(cc.Prefab)
    betLevelsContainerPrefab: cc.Prefab = null;

    private betLevelsContainer: BetLevelsContainer = null;

    stakeContainer: cc.ToggleContainer = null;

    onClickListener = {
        onStakeButtonClick: () => {},
        onLineSelectionClick: () => {},
        onAutoSpinChanged: () => {},
        onHideStakeContainer: () => {},
        onTurboModeChanged: (toggle) => {},
        onStakeQuickChange: (event) => {},
        onStakeToggleChanged: (event, param) => {}
    };

    onLoad() {
        this.createBetLevelContainer();
    }

    setBetLevels(betLevels: number[]) {
        this.betLevelsContainer.setBetLevels(betLevels);
    }

    createBetLevelContainer() {
        const node = cc.instantiate(this.betLevelsContainerPrefab);
        this.betLevelsContainerNode.addChild(node);

        this.betLevelsContainer = node.getComponent(BetLevelsContainer);
        this.stakeContainer = this.betLevelsContainer.containerNode.getComponent(cc.ToggleContainer);
        this.betLevelsContainer.onClickListener = {
            onStakeToggleChanged: (event: cc.Event, param: string) => {
                this.onClickListener.onStakeToggleChanged(event, param);
            },
            onHideStakeContainer: () => {
                this.onClickListener.onHideStakeContainer();
            }
        };
    }

    onStakeButtonClick() {
        this.onClickListener.onStakeButtonClick();
    }

    onLineSelectionClick() {
        this.onClickListener.onLineSelectionClick();
    }

    onAutoSpinChanged() {
        this.onClickListener.onAutoSpinChanged();
    }

    onTurboModeChanged(toggle: cc.Toggle) {
        this.onClickListener.onTurboModeChanged(toggle);
    }

    onStakeQuickChange(event: cc.Event) {
        this.onClickListener.onStakeQuickChange(event);
    }

    updateColor(colorList: BottomAreaDefinedColor) {
        const { textColor, numberColor, buttonBorderColor, winAmountColor } = colorList;

        this.getComponentsInChildren(ChangeNodeColor).forEach((comp) => {
            const labelComp = comp.node.getComponent(cc.Label);
            if (labelComp) {
                comp.updateColor(comp.node.getComponent("LocalizedLabel") ? textColor : numberColor);
            } else {
                comp.updateColor(buttonBorderColor);
            }
        });

        this.winningBet.node.color = cc.Color.WHITE.fromHEX(winAmountColor);
    }
}
