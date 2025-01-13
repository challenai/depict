import type { Graph } from "../graph";
import { CanvasEvent } from "../defs/types";

/**
 * Options to initialize NonWorkerDepict
 */
export interface NonWorkerDepictOptions {
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
   * the graph to run
   */
  graph: Graph;
};

/**
 * NonWorkerDepict runs the graph in the main thread directly,
 * 
 * It's not recommended to run a complex graph in main thread for sake of performance.
 * 
 * But it's enough for the graph with less than 100 event driven nodes or 1000 nodes in a static graph.
 * 
 * **Example Usage**
 *
 * ```jsx
 * const depict = new Depict({
 *   maxLayers: 2,
 *   root: document.getElementById("root"),
 *   graph: new Graph(),
 * });
 * 
 * depict.start();
 * ```
 */
export class NonWorkerDepict {
  // TODO: support dynamic layers?
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
  // graph
  private g: Graph;
  private resizeObserver: ResizeObserver;

  constructor({
    maxLayers,
    root,
    graph,
  }: NonWorkerDepictOptions) {
    this.root = root;
    this.maxLayers = maxLayers;
    this.layers = [];
    this.g = graph;

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
      this.g.triggerEvent(CanvasEvent.CLICK, ev.clientX - this.x, ev.clientY - this.y);
    };
    c.onmouseup = (ev: MouseEvent) => {
      this.g.triggerEvent(CanvasEvent.MOUSE_UP, ev.clientX - this.x, ev.clientY - this.y);
    };
    c.onmousedown = (ev: MouseEvent) => {
      this.g.triggerEvent(CanvasEvent.MOUSE_DOWN, ev.clientX - this.x, ev.clientY - this.y);
    };
    c.onmousemove = (ev: MouseEvent) => {
      const interval = 16;
      const now = (new Date()).getTime();
      if (now > this.moveThrottle + interval) {
        this.moveThrottle = now;
        this.g.triggerEvent(CanvasEvent.MOUSE_MOVE, ev.clientX - this.x, ev.clientY - this.y);
      }
    };

    this.g.initialize(transfers, this.w, this.h);
    this.g.start();
  }

  private handleResize() {
    const rect = this.root.getClientRects().item(0);
    this.x = rect ? rect.x : 0;
    this.y = rect ? rect.y : 0;
    this.w = rect ? rect.width : 0;
    this.h = rect ? rect.height : 0;

    for (let i = 0; i < this.maxLayers; i++) {
      this.initializeCanvas(this.layers[i], i === 0);
    }

    this.g.resize(this.w, this.h);
  }

  /**
   * destroy the graph to release all the resources and memories.
   * 
   * **Example Usage**
   * 
   * ```jsx
   * const depict = new Depict(opts);
   * depict.destroy();
   * ```
   */
  destory() {
    this.g.destroy();
    for (const c of this.layers) {
      c.remove();
    }
    this.resizeObserver.disconnect();
  }

  /**
   * get the graph
   * 
   * **Example Usage**
   * 
   * ```jsx
   * const depict = new Depict(opts);
   * const graph = depict.graph;
   * ```
   */
  get graph(): Graph {
    return this.g;
  }
};