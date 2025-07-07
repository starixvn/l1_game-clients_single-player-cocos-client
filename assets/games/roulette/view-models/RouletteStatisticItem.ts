const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteStatisticItem extends cc.Component {
    @property(cc.Label)
    firstValue: cc.Label = null;

    @property(cc.Label)
    secondValue: cc.Label = null;

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    public updateProgressBar(firstCount: number, secondCount: number) {
        let progress = firstCount / (firstCount + secondCount);
        const minValue = 0.15;
        const maxValue = 0.85;
        progress = Math.min(progress, maxValue);
        progress = Math.max(progress, minValue);

        this.progressBar.progress = progress;
    }

    setData(firstValue: number, secondValue: number) {
        this.firstValue.string = `${firstValue}%`;
        this.secondValue.string = `${secondValue}%`;
    }
}
