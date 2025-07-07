import { EventEmitter } from "events";

export class UserBaseHandler extends EventEmitter {
  constructor() {
    super();

    this.setMaxListeners(0);
  }
}
