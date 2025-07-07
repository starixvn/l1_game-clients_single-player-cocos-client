const { ccclass, property } = cc._decorator;
const EPSILON = 1e-4;

@ccclass
export default class CustomScrollView extends cc.ScrollView {
    _onMouseWheel(event, captureListeners) {
        //disable mouse wheel
    }
}
