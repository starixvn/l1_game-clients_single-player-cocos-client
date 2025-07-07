const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class NotificationItem extends cc.Component {
    abstract setData(data: any);
}
