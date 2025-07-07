const { ccclass, property } = cc._decorator;

@ccclass
export default class TypingEffectLabel extends cc.Component {
  private readonly label: cc.Label = null;
  private readonly duration = 3;
  private readonly actionTag = 1000;

  getLabel() {
    return this.label != null ? this.label : this.getComponent(cc.Label);
  }

  public setAnimationText(text: string) {
    if (text.length < 2) {
      this.setText(text);
      return;
    }
    this.node.stopActionByTag(this.actionTag);

    const loop = text.length;
    let i = 1;
    const stepTime = 0.08;
    const repeat = cc.sequence(
      cc.callFunc(() => {
        this.getLabel().string = text.substring(0, i);
        i++;
      }),
      cc.delayTime(stepTime)
    );
    const action = cc.repeat(repeat, loop);
    action.setTag(this.actionTag);
    this.node.runAction(action);
  }

  public setText(text: string) {
    this.node.stopActionByTag(this.actionTag);
    this.getLabel().string = text;
  }
}
