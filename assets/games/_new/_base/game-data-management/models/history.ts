import { EventEmitter } from "events";

export class History<Model> extends EventEmitter {
  static Events = {
    CHANGE: "history:change",
    FIFO: "history:fifo",
  };

  protected data: Model[];

  constructor() {
    super();
    this.data = [];
    this.setMaxListeners(0);
  }

  push(...model: Model[]) {
    this.data.push(...model);
    this.dispatchChangeEvent();
  }

  unshift(...model: Model[]) {
    this.data.unshift(...model);
    this.dispatchChangeEvent();
  }

  fifo(model: Model) {
    this.data.unshift(model);
    this.data.pop();
    this.dispatchChangeEvent();
    this.emit(History.Events.FIFO, this.list);
  }

  cleanWithoutTriggerEvent() {
    this.data = [];
  }

  get list() {
    return [...this.data];
  }

  protected dispatchChangeEvent() {
    this.emit(History.Events.CHANGE, this.list);
  }
}
