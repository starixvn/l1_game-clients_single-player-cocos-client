import * as _ from "lodash";
import GameBase from "../../_base/GameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import VipFishPrawnCrabStatsItem from "./VipFishPrawnCrabStatsItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VipFishPrawnCrabStats extends cc.Component {
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    characterView: cc.Node = null;

    @property(cc.Node)
    characterContent: cc.Node = null;

    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property({ type: cc.Label })
    characterCountLabels: cc.Label[] = [];

    @property({ type: cc.SpriteFrame })
    characterIcons: cc.SpriteFrame[] = [];

    @property({ type: cc.SpriteFrame })
    highlightCharacterIcons: cc.SpriteFrame[] = [];

    @property(cc.Label)
    mountainPercent: cc.Label = null;

    @property(cc.Label)
    oceanPercent: cc.Label = null;

    private isCharacterMode = true;

    public init(main: GameBase) {
        const condition = () => {
            const finishHandler = main.finishHandler as GameBaseFinishHandler;
            return (
                main.currentTimeRemaining < main.config.stopBetTime ||
                main.currentTimeRemaining > main.config.fullTime - finishHandler.getResultAnimationTime() + 0.5
            );
        };
        this.logControl.init(condition);
    }

    renderData(dataLogs: any[]) {
        if (!dataLogs || !dataLogs.length) {
            return;
        }

        const statsData = [];
        dataLogs.forEach((log) => {
            statsData.unshift(log.settlementResult.mountain ? 0 : 1);
        });
        this.logControl && this.logControl.setData(statsData);

        this.characterContent.removeAllChildren();
        const characterCounts = this.itemPrefab && this.addDataLogs(dataLogs);

        this.characterContent.getComponent(cc.Layout).updateLayout();
        this.characterView.getComponent(cc.ScrollView).horizontal = this.characterView.width < this.characterContent.width;
        this.characterContent.getComponent(cc.Widget).updateAlignment();

        this.calculateBasicPercent(dataLogs);
        characterCounts && this.updateCountLabels(characterCounts);
    }

    private updateCountLabels(characterCounts: any) {
        this.characterCountLabels.forEach((label, index) => {
            label.string = characterCounts[index] ?? "0";
        });
    }

    addDataLogs(dataLogs: any) {
        const characterCounts = {};
        dataLogs.forEach((log, roundIndex) => {
            const node = cc.instantiate(this.itemPrefab);
            const itemComponent = node.getComponent(VipFishPrawnCrabStatsItem);

            _.values(log.result).forEach((character: number, index: number) => {
                characterCounts[character] = (characterCounts[character] ?? 0) + 1;
                itemComponent.setData(this.characterIcons[character], this.highlightCharacterIcons[character], roundIndex, index);
            });

            this.characterContent.addChild(node);
        });

        return characterCounts;
    }

    calculateBasicPercent(dataLogs: any) {
        let mountainCount = 0;

        dataLogs.forEach((log) => {
            mountainCount += log.settlementResult.mountain ? 1 : 0;
        });
        const mountainPercent = Math.floor((mountainCount * 100) / dataLogs.length);
        this.mountainPercent.string = `${mountainPercent}%`;
        this.oceanPercent.string = `${100 - mountainPercent}%`;
    }

    changeDisplayMode() {
        this.isCharacterMode = !this.isCharacterMode;

        this.characterView.active = this.isCharacterMode;
        this.logControl.node.active = !this.isCharacterMode;
    }
}
