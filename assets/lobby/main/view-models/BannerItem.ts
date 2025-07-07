const { ccclass, property } = cc._decorator;

@ccclass
export default class BannerItem extends cc.Component {
    @property
    displayTime = 4;
}
