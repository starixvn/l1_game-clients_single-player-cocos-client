import BitcoinMaster from "./BitcoinMaster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitCoinMasterProgressBar extends cc.Component {
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    @property(cc.Node)
    leftLine: cc.Node = null;

    @property(cc.Node)
    rightLine: cc.Node = null;

    mainGame: BitcoinMaster = null;
    time = 0;

    onLoad() {
        this.setLinePosition();
    }

    setLinePosition() {
        const leftWidget = this.leftLine.getComponent(cc.Widget);
        leftWidget.left = (40 * this.progressBar.totalLength) / 120 - this.leftLine.width + 9;
        const rightWidget = this.rightLine.getComponent(cc.Widget);
        rightWidget.right = (30 * this.progressBar.totalLength) / 120 - this.rightLine.width + 8;
    }

    init(main: BitcoinMaster) {
        this.mainGame = main;

        this.updateProgress();
        this.unschedule(this.updateProgress);
        this.schedule(this.updateProgress, 1);
    }

    updateProgress() {
        let progress;
        const betDuration = 45;
        const waitDuration = 60;
        const resultDuration = 15;
        const betAndWaitDuration = betDuration + waitDuration;
        const firstPoint = 40 / this.mainGame.config.fullTime;
        const secondPoint = 90 / this.mainGame.config.fullTime;
        const secondPart = 50 / this.mainGame.config.fullTime;
        const thirdPart = 30 / this.mainGame.config.fullTime;

        this.time = betAndWaitDuration - this.mainGame.currentTimeRemaining;
        if (this.time <= 0) {
            this.time = betAndWaitDuration + this.mainGame.config.fullTime - this.mainGame.currentTimeRemaining;
        }

        if (this.time >= betAndWaitDuration) {
            progress = secondPoint + (thirdPart * (this.time - betAndWaitDuration)) / resultDuration;
        } else if (this.time >= betDuration) {
            progress = firstPoint + (secondPart * (this.time - betDuration)) / waitDuration;
        } else {
            progress = firstPoint * (this.time / betDuration);
        }
        this.progressBar.progress = progress;
    }
}
