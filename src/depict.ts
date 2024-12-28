import type { MsgInit } from "./defs/messages";
import { CanvasEvent, MessageType } from "./defs/types";

export interface DepictOptions {
  maxLayers: number;
  root: HTMLDivElement;
  worker: Worker;
};

// TODO: listen resize event
// TODO: support dynamic layers?
export class Depict {
  // root element to hold graph
  private root: HTMLElement;
  // canvas layers
  private layers: HTMLCanvasElement[];
  private maxLayers: number;
  // dom posistion of current graph
  private x: number;
  private y: number;
  private w: number;
  private h: number;
  // minimum event trigger interval
  private moveThrottle: number;
  // worker thread
  worker: Worker;

  constructor({
    maxLayers,
    root,
    worker,
  }: DepictOptions) {
    this.root = root;
    this.maxLayers = maxLayers;
    this.layers = [];
    this.worker = worker;

    const rect = this.root.getClientRects().item(0);
    this.x = rect ? rect.x : 0;
    this.y = rect ? rect.y : 0;
    this.w = rect ? rect.width : 0;
    this.h = rect ? rect.height : 0;

    this.moveThrottle = 0;

    for (let i = 0; i < this.maxLayers; i++) {
      const canvas = document.createElement("canvas");
      this.initializeCanvas(canvas, this.w, this.h, i === 0);
      root.appendChild(canvas);
      this.layers.push(canvas);
    }
  }

  initializeCanvas(
    canvas: HTMLCanvasElement,
    w: number,
    h: number,
    base: boolean,
  ) {
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    if (!base) {
      canvas.style.backgroundColor = "transparent";
    }
  }

  start() {
    const transfers: OffscreenCanvas[] = [];
    for (const c of this.layers) {
      transfers.push(c.transferControlToOffscreen());
    }

    const c = this.layers[this.layers.length - 1];
    c.onclick = (ev: MouseEvent) => {
      // console.log(ev.clientX - this.x, ev.clientY - this.y);
      this.worker.postMessage({ type: MessageType.EVENT, msg: { x: ev.clientX - this.x, y: ev.clientY - this.y, typ: CanvasEvent.CLICK } });
    };
    c.onmouseup = (ev: MouseEvent) => {
      this.worker.postMessage({ type: MessageType.EVENT, msg: { x: ev.clientX - this.x, y: ev.clientY - this.y, typ: CanvasEvent.MOUSE_UP } });
    };
    c.onmousedown = (ev: MouseEvent) => {
      this.worker.postMessage({ type: MessageType.EVENT, msg: { x: ev.clientX - this.x, y: ev.clientY - this.y, typ: CanvasEvent.MOUSE_DOWN } });
    };
    c.onmousemove = (ev: MouseEvent) => {
      const interval = 16;
      const now = (new Date()).getTime();
      if (now > this.moveThrottle + interval) {
        this.moveThrottle = now;
        this.worker.postMessage({ type: MessageType.EVENT, msg: { x: ev.clientX - this.x, y: ev.clientY - this.y, typ: CanvasEvent.MOUSE_MOVE } });
      }
    };

    const msg: MsgInit = {
      layers: transfers,
    };
    this.worker.postMessage({ type: MessageType.INIT, msg }, transfers);
  }

  destory() {
    this.worker.postMessage({ type: MessageType.DESTORY }, []);
    for (const c of this.layers) {
      c.remove();
    }
  }
};