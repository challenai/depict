import type { DrawableOptions, Mesh, MeshSpecificOptions, Text, TextSpecificOptions } from "@physical/drawable";
import { Renderer } from "@physical/render";
import { initializeContext } from "@physical/context";
import { BinaryEventHandler } from "./events";
import type { ShadowElement } from "./element";
import type { CanvasEvent } from "@defs/types";

export interface LayerOptions {
  renderer?: Renderer;
  meshOptions?: MeshSpecificOptions;
  textOptions?: TextSpecificOptions;
  drawableOptions?: DrawableOptions;
  update?: boolean;
  dynamic?: boolean;
}

export class Layer {
  // canvas
  private canvas: OffscreenCanvas;
  // canvas context
  private ctx: OffscreenCanvasRenderingContext2D;

  // render queue to store all the layer elements
  private queue: ShadowElement[];
  // previous elements set
  private prev: Set<ShadowElement>;
  // current frame elements set
  private next: Set<ShadowElement>;

  // should we update the elements before render ?
  private update: boolean;
  // whether the layer should be rerendered ?
  dirty: boolean;
  // whether the layer should be rerendered each time ?
  dynamic: boolean;
  // element counter to produce index, to provide sequential layout in event trigger
  private counter: number;

  // default renderer when not specified
  private dr: Renderer;
  private dmo: MeshSpecificOptions;
  private dto: TextSpecificOptions;
  private ddo: DrawableOptions;

  // width of the graph
  private w: number;
  // height of the graph
  private h: number;

  private evClick: BinaryEventHandler;
  private evMouseUp: BinaryEventHandler;
  private evMouseDown: BinaryEventHandler;
  private evActive: BinaryEventHandler;
  private evMove: BinaryEventHandler;

  constructor(
    canvas: OffscreenCanvas,
    defaultRenderer: Renderer,
  ) {
    // canvas
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    // elements
    this.queue = [];
    this.prev = new Set();
    this.next = new Set();

    // render context
    this.dr = defaultRenderer;
    this.dmo = {};
    this.dto = {};
    this.ddo = {};
    this.update = true;
    initializeContext(this.ctx, this.dmo, this.dto, this.ddo);

    // width and height
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    // elements update
    this.dirty = true;
    this.dynamic = false;
    this.counter = 0;

    // events
    this.evClick = new BinaryEventHandler();
    this.evMouseUp = new BinaryEventHandler();
    this.evMouseDown = new BinaryEventHandler();
    this.evActive = new BinaryEventHandler();
    this.evMove = new BinaryEventHandler();
  }

  // update elements in queue before render
  updateElements(delta: number) {
    if (!this.update || !this.queue) return;
    for (const element of this.queue) {
      if (element.update) {
        element.update(element, delta)
      }
    }
  }

  // render elements at coordinates (x, y)
  renderQueue(x: number, y: number) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.counter = 0;
    this.ctx.translate(x, y);
    this.renderElements(x, y, this.queue);
    this.ctx.translate(-x, -y);
    this.dirty = false;
    for (const el of this.prev) {
      el._state.destory = true;
    }
    this.prev.clear();
    this.prev, this.next = this.next, this.prev;
  }

  // build events trigger for a single given element
  private buildElementEvents(element: ShadowElement) {
    if (!element.contain) return;
    if (element.onClick) {
      this.evClick.add(element);
    }
    if (element.onMouseup) {
      this.evMouseUp.add(element);
    }
    if (element.onMousedown) {
      this.evMouseDown.add(element);
    }
    if (element.onMouseenter || element.onMouseleave) {
      this.evActive.add(element);
    }
    if (element.onMousemove) {
      this.evMove.add(element);
    }
  }

  triggerEvents(typ: CanvasEvent, renderLayer: (layer: number) => void, x: number, y: number): boolean {
    // TODO
    return false;
  }

  private renderElements(x: number, y: number, elements?: ShadowElement[]) {
    // TODO
  }

  // run an extra render callback hook after an element finished its draw for pathes and texts
  private postRender(callback: (ctx: OffscreenCanvasRenderingContext2D) => void) {
    this.ctx.save();
    callback(this.ctx);
    this.ctx.restore();
  }

  // reset the render queue to render from scratch, if a group of new elements are given.
  // on this way, we don't compare to find the difference, instead, we destory all the built events, rebuild from scratch
  updateQueue(elements: ShadowElement[]) {
    this.queue = elements;
    this.prev.clear();
    this.next.clear();
    this.dirty = true;
  }

  // update layer options to turn on/off some function flags or change base styles.
  updateOptions(options: LayerOptions) {
    if (options.renderer) this.dr = options.renderer;
    if (options.meshOptions) this.dmo = options.meshOptions;
    if (options.textOptions) this.dto = options.textOptions;
    if (options.drawableOptions) this.ddo = options.drawableOptions;

    if (typeof options.update === "boolean") this.update = options.update;
    if (typeof options.dynamic === "boolean") this.dynamic = options.dynamic;

    if (options.meshOptions || options.textOptions || options.drawableOptions) {
      initializeContext(this.ctx, this.dmo, this.dto, this.ddo);
    }
  }
}