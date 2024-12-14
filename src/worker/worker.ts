import { Graph } from "./graph";
import { MessageType } from "../defs/types";

export const messageHandler = {
  callback: (_: MessageEvent<any>) => { },
};

export const gw = new Graph();

onmessage = (ev: MessageEvent) => {
  const eventType = ev.data.type;
  const msg = ev.data.message;
  switch (eventType) {
    case MessageType.INIT:
      gw.initializeGraph();
      break;
    case MessageType.DESTORY:
      gw.destory();
      break;
    case MessageType.EVENT:
      gw.triggerEvent();
      break;
    default:
      messageHandler.callback(ev);
      break;
  }
};
