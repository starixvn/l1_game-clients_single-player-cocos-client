export default interface Connection {
  close(): void;
  on(eventName: string, eventHandler: Function): void;
  once(eventName: string, eventHandler: Function): void;
  emit(eventName: string, ...args: any[]): void;
  removeListener(eventName: string, handler?: Function): void;
  connected: boolean;
}
