import type { MsgInit, MsgSize } from "./defs/messages";
import { CanvasEvent, MessageType } from "./defs/types";

/**
 * Options to initialize Depict
 */
export interface DepictOptions {
  /**
   * max layers count of the graph
   */
  maxLayers: number;
  /**
   * root element to hold graph,
   * 
   * the graph will automatically resize to fit the root element.
   */
  root: HTMLDivElement;
  /**
   * worker thread to run the graph,
   * 
   * you can run multiple graphs in a single one worker.
   * 
   * or you can run only one graph per worker.
   */
  worker: Worker;
};

/**
 * Depict runs in the main thread,
 * 
 * it's the entrance of a multi-thread graph.
 * 
 * It will communite with the worker thread to draw the graph.
 *
 * **Example Usage**
 *
 * ```jsx
 * const depict = new Depict({
 *   maxLayers: 2,
 *   root: document.getElementById("root"),
 *   worker: new Worker("./worker.js"),
 * });
 * 
 * depict.start();
 * ```
 */
export class Depict {
  // TODO: support dynamic layers?
  // root element to hold graph
  private root: HTMLElement;
  // canvas layers
  private layers: HTMLCanvasElement[];
  private maxLayers: number;
  // size of current graph
  private w: number;
  private h: number;
  // minimum event trigger interval
  private moveThrottle: number;
  // worker thread
  private worker: Worker;
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

    const rect = this.root.getBoundingClientRect();
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

  private initializeCanvas(
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

  /**
   * start the graph now.
   * 
   * the graph will be initialized and start to run.
   * 
   * **Example Usage**
   * 
   * ```jsx
   * const depict = new Depict(opts);
   * depict.start();
   * ```
   */
  start() {
    const transfers: OffscreenCanvas[] = [];
    for (const c of this.layers) {
      transfers.push(c.transferControlToOffscreen());
    }

    const c = this.layers[this.layers.length - 1];
    c.onclick = (ev: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      this.worker.postMessage({ type: MessageType.EVENT, msg: { x: ev.clientX - rect.left, y: ev.clientY - rect.top, typ: CanvasEvent.CLICK } });
    };
    c.onmouseup = (ev: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      this.worker.postMessage({ type: MessageType.EVENT, msg: { x: ev.clientX - rect.left, y: ev.clientY - rect.top, typ: CanvasEvent.MOUSE_UP } });
    };
    c.onmousedown = (ev: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      this.worker.postMessage({ type: MessageType.EVENT, msg: { x: ev.clientX - rect.left, y: ev.clientY - rect.top, typ: CanvasEvent.MOUSE_DOWN } });
    };
    c.onmousemove = (ev: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      const interval = 16;
      const now = (new Date()).getTime();
      if (now > this.moveThrottle + interval) {
        this.moveThrottle = now;
        this.worker.postMessage({ type: MessageType.EVENT, msg: { x: ev.clientX - rect.left, y: ev.clientY - rect.top, typ: CanvasEvent.MOUSE_MOVE } });
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

  private handleResize() {
    const rect = this.root.getBoundingClientRect();
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

  /**
   * destroy the graph to release all the resources and memories.
   * 
   * **Example Usage**
   * 
   * ```jsx
   * depict.destroy();
   * ```
   */
  destroy() {
    this.worker.postMessage({ type: MessageType.DESTROY }, []);
    for (const c of this.layers) {
      c.remove();
    }
    this.resizeObserver.disconnect();
  }
};