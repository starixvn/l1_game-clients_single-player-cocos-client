import NoticeUtil from "../utils/NoticeUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UmWarning extends cc.Component {
    @property(cc.Label)
    message: cc.Label = null;

    show(data: any) {
        if (data && data.um_message) {
            this.message.string = NoticeUtil.getMessageByLocale(data.um_message);
        }

        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }
}
