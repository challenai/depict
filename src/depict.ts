import type { MsgInit, MsgSize } from "./defs/messages";
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
  private resizeObserver: ResizeObserver;

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
      this.initializeCanvas(canvas, i === 0);
      root.appendChild(canvas);
      this.layers.push(canvas);
    }

    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    this.resizeObserver.observe(this.root);
  }

  initializeCanvas(
    canvas: HTMLCanvasElement,
    base: boolean,
  ) {
    canvas.style.width = `${this.w}px`;
    canvas.style.height = `${this.h}px`;
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
      size: {
        w: this.w,
        h: this.h,
      },
    };
    this.worker.postMessage({ type: MessageType.INIT, msg }, transfers);
  }

  handleResize() {
    const rect = this.root.getClientRects().item(0);
    this.x = rect ? rect.x : 0;
    this.y = rect ? rect.y : 0;
    this.w = rect ? rect.width : 0;
    this.h = rect ? rect.height : 0;

    for (let i = 0; i < this.maxLayers; i++) {
      this.initializeCanvas(this.layers[i], i === 0);
    }

    const msg: MsgSize = {
      w: this.w,
      h: this.h,
    };
    this.worker.postMessage({ type: MessageType.RESIZE, msg }, []);
  }

  destroy() {
    this.worker.postMessage({ type: MessageType.DESTROY }, []);
    for (const c of this.layers) {
      c.remove();
    }
    this.resizeObserver.disconnect();
  }
};