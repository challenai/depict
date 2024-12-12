import { MessageType } from "./defs/types";
import type { Layer } from "./layer";

class GraphWorker {
  // TODO: 1. add offset API
  // TODO: 2. events trigger
  // TODO: 3. impl initialize/destory process
  // TODO: 4. design and impl events hooks
  // TODO: 5. user self-coustomed messages from main thread
  // the layers of the graph
  layers: Layer[];

  constructor() {
    this.layers = [];
  }

  initializeGraph() { }

  triggerEvent() { }

  destory() { }
}

const gw = new GraphWorker();

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
    case MessageType.DESTORY:
      gw.triggerEvent();
      break;
  }
};