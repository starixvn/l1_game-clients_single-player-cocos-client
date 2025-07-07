const { ccclass, property } = cc._decorator;

@ccclass
export default class GameAdsItem extends cc.Component {
    @property
    displayTime = 4;
}
