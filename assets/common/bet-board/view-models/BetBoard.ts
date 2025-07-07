import { lazyInject } from "../../../Application";
import { nFormatter } from "../../../common/helpers/NumberHelper";
import AudioManager from "../../audio/AudioManager";
import BaseComponent from "../../BaseComponent";
import BetBoardConfig from "./BetBoardConfig";

const { ccclass, property } = cc._decorator;

export interface BetInfo {
    choice: string;
    bet: number;
    betItem: cc.Node;
    maxBet: number;
}

@ccclass
export default class BetBoard extends BaseComponent {
    @property(cc.Button)
    okButton: cc.Button = null;

    @property(cc.Node)
    itemContainer: cc.Node = null;

    @lazyInject(BetBoardConfig)
    private readonly config: BetBoardConfig;

    public info: any = null;

    public callback = {
        acceptedBet: (info: any) => {},
        changedBet: (info: any) => {},
        cancel: (info: any) => {},
        getPreset: () => 0
    };

    setItems(items: number[]) {
        const listItem = items;
        this.itemContainer.children.forEach((child, index) => {
            const value = listItem[index]?.toString() || "";
            child.name = value;

            const show = value !== "";
            child.active = show;

            const label = child.children[0].getComponent(cc.Label);

            if (show) {
                let valueString = "";
                if (!this.config.shortenValue) {
                    valueString = `+${value}`;
                } else {
                    valueString = `+${nFormatter(value)}`;
                }

                label.string = valueString;
            }
        });
    }

    public onAcceptBet() {
        AudioManager.getInstance().playClick();
        if (this.checkBetLimit()) {
            this.callback.acceptedBet(this.info);
            this.closeBoard();
        }
    }

    protected checkBetLimit(): boolean {
        return true;
    }

    protected closeBoard() {
        if (this.isAlive()) {
            this.node.active = false;
            this.info = null;
        }
    }

    public onCloseClick() {
        AudioManager.getInstance().playClick();
        this.close();
    }

    public onClearClick() {
        AudioManager.getInstance().playClick();
        this.info.bet = 0;
        this.betChanged();
    }

    public close() {
        this.info && this.callback.cancel(this.info);
        this.closeBoard();
    }

    public show(info: any) {
        if (this.info) {
            if (info.choice === this.info.choice) {
                return;
            }
            this.callback.cancel(this.info);
        }

        this.info = info;
        this.info.bet = info.bet || this.callback.getPreset();
        this.info.bet = Math.min(this.info.bet, this.info.maxBet());
        this.node.active = true;
        this.betChanged();
    }

    public onItemBetClicked(e) {
        AudioManager.getInstance().playClick();
        const amount = parseInt(e.target.name) || this.info.maxBet();
        this.info.bet += amount;
        this.info.bet = Math.min(this.info.bet, this.info.maxBet());
        this.betChanged();
    }

    protected betChanged() {
        this.callback.changedBet(this.info);
        this.okButton.interactable = this.info.bet > 0;
    }
}
