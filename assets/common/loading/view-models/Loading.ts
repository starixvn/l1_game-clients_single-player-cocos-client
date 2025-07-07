const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {
    @property(cc.Label)
    percent: cc.Label = null;

    private prevPercent = 0;

    onEnable() {
        this.percent.node.active = true;
    }

    onDisable() {
        this.percent.string = "0%";
    }

    setDefaultPercent() {
        this.setLoadingVisibility(true);
        this.percent.string = "0%";
    }

    onData(data: any) {
        if (data.active) {
            this.node.active = data.active;
        }
        if (data.text) {
            this.percent.string = data.text;
        }
    }

    onProgress(completedCount: number, totalCount: number) {
        const percent = (100 * completedCount) / totalCount;
        this.showPercent(percent);
    }

    onProgressWithStartPercent(startPercent: number, endPercent: number, completedCount: number, totalCount: number) {
        const percent = startPercent + ((endPercent - startPercent) * completedCount) / totalCount;
        this.showPercent(percent);
    }

    showPercent(percent: number) {
        if (!this.percent) {
            return;
        }

        this.percent.node.active = true;
        if (percent > this.prevPercent) {
            this.percent.string = `${percent.toFixed(0)}%`;
            this.prevPercent = percent;
        }
    }

    setLoadingVisibility(status: boolean) {
        this.node?.isValid && (this.node.active = status);
    }
}
