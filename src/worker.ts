import { MessageType } from "./defs/types";

class Layer {
  // layer index
  idx: number;
  // canvas
  canvas: OffscreenCanvas;
  // canvas context
  ctx: OffscreenCanvasRenderingContext2D;

  constructor(idx: number, canvas: OffscreenCanvas) {
    this.idx = idx;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
  }
}

class GraphWorker {
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