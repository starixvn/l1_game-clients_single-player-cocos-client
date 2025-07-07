import Simulated3DCards from "./Simulated3DCards";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SwapCards extends cc.Component {
    @property(Simulated3DCards)
    simulated3DCards: Simulated3DCards = null;

    @property(cc.Node)
    originDealerCard: cc.Node = null;

    @property(cc.Node)
    originPlayerCard: cc.Node = null;

    @property(cc.Node)
    dealer2DCard: cc.Node = null;

    @property(cc.Node)
    player2DCard: cc.Node = null;

    @property(cc.Node)
    firstLeftPoint: cc.Node = null;

    @property(cc.Node)
    secondLeftPoint: cc.Node = null;

    @property(cc.Node)
    firstRightPoint: cc.Node = null;

    @property(cc.Node)
    secondRightPoint: cc.Node = null;

    private readonly timeShowUp = 0.3;
    private readonly timeSwap = 1;
    pickUp3DCardsTween: cc.Tween;
    swap2DCardsTween: cc.Tween;
    dropDown3DCardsTween: cc.Tween;
    dealer2DCardsPosition: cc.Vec2;
    player2DCardPosition: cc.Vec2;
    dealer2DCardsScale: cc.Vec2;

    protected onLoad(): void {
        this.node.active = true;
        this.showSimulated3DCards(false);
        this.dealer2DCardsPosition = cc.v2(this.dealer2DCard.x, this.dealer2DCard.y);
        this.player2DCardPosition = cc.v2(this.player2DCard.x, this.player2DCard.y);
        this.dealer2DCardsScale = cc.v2(this.dealer2DCard.scaleX, this.dealer2DCard.scaleY);
    }

    protected activeOriginCards(status: boolean) {
        this.originDealerCard.active = status;
        this.originPlayerCard.active = status;
    }

    async swapCards() {
        await this.pickUp3DCards(this.timeShowUp);
        await this.swap2DCards(this.timeSwap);
        await this.dropDown3DCards(this.timeShowUp);
        return this;
    }

    resetAllTween() {
        this.node.stopAllActions();
        this.pickUp3DCardsTween && this.pickUp3DCardsTween.stop();
        this.swap2DCardsTween && this.swap2DCardsTween.stop();
        this.dropDown3DCardsTween && this.dropDown3DCardsTween.stop();

        this.dealer2DCard.stopAllActions();
        this.player2DCard.stopAllActions();
    }

    reset() {
        this.resetAllTween();
        this.reset2DCards();
        this.showSimulated3DCards(false);
        this.show2DCards(false);
    }

    showSimulated3DCards(state: boolean) {
        this.simulated3DCards.node.active = state;
    }

    show2DCards(status: boolean) {
        this.dealer2DCard.active = status;
        this.player2DCard.active = status;
    }

    pickUp3DCards(delayTime: number) {
        return new Promise<void>((resolve) => {
            this.pickUp3DCardsTween = cc
                .tween(this)
                .call(() => {
                    this.activeOriginCards(false);
                    this.showSimulated3DCards(true);
                    this.simulated3DCards.moveYAndRotationCard(30, 50, 40, "sineIn");
                })
                .delay(delayTime)
                .call(() => {
                    this.showSimulated3DCards(false);
                    resolve();
                })
                .start();
        });
    }

    swap2DCards(duration: number) {
        const bezierLeft = [
            cc.v2(this.firstLeftPoint.x, this.firstLeftPoint.y),
            cc.v2(this.secondLeftPoint.x, this.secondLeftPoint.y),
            cc.v2(this.player2DCard.x, this.player2DCard.y)
        ];

        const bezierRight = [
            cc.v2(this.secondRightPoint.x, this.secondRightPoint.y),
            cc.v2(this.firstRightPoint.x, this.firstRightPoint.y),
            cc.v2(this.dealer2DCard.x, this.dealer2DCard.y)
        ];
        this.show2DCards(true);

        return new Promise<void>((resolve) => {
            this.swap2DCardsTween = cc
                .tween(this)
                .call(() => {
                    this.dealer2DCard.runAction(cc.spawn(cc.bezierTo(duration, bezierLeft), cc.scaleTo(duration * 0.8, 1, 1)));
                    this.player2DCard.runAction(
                        cc.spawn(
                            cc.bezierTo(duration, bezierRight),
                            cc.scaleTo(duration * 0.8, this.dealer2DCardsScale.x, this.dealer2DCardsScale.y)
                        )
                    );
                })
                .delay(duration)
                .call(() => {
                    this.reset2DCards();
                    resolve();
                })
                .start();
        });
    }

    dropDown3DCards(delayTime: number) {
        this.show2DCards(false);
        this.showSimulated3DCards(true);

        return new Promise<void>((resolve) => {
            this.dropDown3DCardsTween = cc
                .tween(this)
                .call(() => {
                    this.simulated3DCards.moveYAndRotationCard(0, 0, 0, "sineOut");
                })
                .delay(delayTime)
                .call(() => {
                    this.activeOriginCards(true);
                    this.showSimulated3DCards(false);
                })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    reset2DCards() {
        this.dealer2DCard.setPosition(this.dealer2DCardsPosition);
        this.dealer2DCard.setScale(this.dealer2DCardsScale);
        this.player2DCard.setPosition(this.player2DCardPosition);
        this.player2DCard.scale = 1;
    }
}
