import { lazyInject } from "../../../Application";
import CommonDialog from "../../_base/view-models/CommonDialog";
import AudioManager from "../../audio/AudioManager";
import BetBoardConfig from "../../bet-board/view-models/BetBoardConfig";
import { nFormatter, numberWithCommas } from "../../helpers/NumberHelper";
import BaseComponent from "../../BaseComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PresetBet extends BaseComponent {
    @property(cc.Label)
    betValue: cc.Label = null;

    @property(cc.Button)
    betButton: cc.Button = null;

    @property(cc.Node)
    itemContainer: cc.Node = null;

    @lazyInject(BetBoardConfig)
    private readonly config: BetBoardConfig;

    protected betAmount = 0;
    public onChangedBet = (betAmount: number) => {};
    public getPreset = () => {
        return 0;
    };
    protected commonDialog: any;
    private isOpened = false;

    onLoad() {
        this.commonDialog = this.node.getComponent(CommonDialog);
    }

    setItems(items: number[]) {
        const listItem = items;
        this.itemContainer.children.forEach((child, index) => {
            const value = listItem[index]?.toString() || "";
            child.name = value.toString();

            const show = value !== "";
            child.active = show;

            if (show) {
                const valueString = this.config.shortenValue ? `+${nFormatter(value)}` : `+${value}`;
                child.children[0].getComponent(cc.Label).string = valueString;
            }
        });
    }

    onEnable() {
        this.betAmount = this.getPreset();
        this.updateBetAmount();
    }

    public clearBet() {
        AudioManager.getInstance().playClick();
        this.betAmount = 0;
        this.updateBetAmount();
    }

    public onClose() {
        AudioManager.getInstance().playClick();
        this.close();
    }

    public close() {
        this.isOpened = false;
        this.commonDialog.closeDialog();
    }

    public forceClose() {
        if (this.isAlive()) {
            this.isOpened = false;
            this.node.active = false;
        }
    }

    public onResetBet() {
        this.close();
        this.clearBet();
        this.onChangedBet(this.betAmount);
    }

    public onAcceptBet() {
        this.close();
        this.onChangedBet(this.betAmount);
    }

    public onItemBetClicked(e) {
        AudioManager.getInstance().playClick();
        const amount = +e.target.name;
        this.betAmount = this.betAmount + amount;
        this.updateBetAmount();
    }

    public show() {
        this.isOpened = true;
        this.commonDialog.showDialog();
    }

    public toggle() {
        if (this.isOpened) {
            this.close();
        } else {
            this.show();
        }
    }

    private updateBetAmount() {
        this.betValue.string = numberWithCommas(this.betAmount);
    }
}
