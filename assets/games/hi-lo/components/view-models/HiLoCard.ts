import NewCard from "../../../../common/new-card/view-models/NewCard";
const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoCard extends NewCard {
    @property(cc.Node)
    highlight: cc.Node = null;

    setLargeSuiteImage(lowerCaseRank: string) {
        if (+this.card.rank || this.card.rank === "A") {
            this.largeSuite.spriteFrame = this.atlas.getSpriteFrame(this.suffix[this.card.suit]);
            this.largeSuite.node.width = 64;
            this.largeSuite.node.height = 70;
        } else {
            this.largeSuite.spriteFrame = this.atlas.getSpriteFrame(this.picture[lowerCaseRank]);
            this.largeSuite.node.width = 90;
            this.largeSuite.node.height = 135;
        }
    }
}
