const { ccclass, property } = cc._decorator;

@ccclass
export default class StatisticProgress extends cc.Component {
    @property({ type: cc.Node })
    frames: cc.Node[] = [];

    @property({ type: cc.Label })
    labels: cc.Label[] = [];

    @property
    prefixes: string[] = ["TÀI", "XỈU"];

    @property
    suffix = "%";

    @property
    dynamic = true;

    @property
    showPrefix = false;

    public setProgress(values: number[], total: number) {
        const count = this.frames.length;
        for (let i = 0; i < count; i++) {
            const value = Math.round((values[i] * 100) / total);
            const prefix = this.showPrefix ? `${this.prefixes[i]} ` : ``;
            this.labels[i].string = `${prefix}${value}${this.suffix}`;
            this.labels[i].node.active = true;

            this.frames[i].width = this.dynamic ? (values[i] / total) * this.node.width : this.node.width / count;
        }
        this.updateFakeProgress();
    }

    public updateFakeProgress() {
        const count = this.frames.length;
        const limit = 18;
        let delta = 0;
        let j = 0;
        for (let i = 0; i < count; i++) {
            const width = this.frames[i].width;
            if (width < limit) {
                delta += limit - width;
            } else {
                j++;
            }
        }
        if (j === 0) {
            return;
        }
        const offset = delta / j;
        for (let i = 0; i < count; i++) {
            const width = this.frames[i].width;
            if (width < limit) {
                this.frames[i].width = limit;
            } else {
                this.frames[i].width -= offset;
            }
        }
    }

    public clear() {
        const count = this.frames.length;
        for (let i = 0; i < count; i++) {
            this.labels[i].node.active = false;
            this.frames[i].width = this.node.width / count;
        }
    }
}
