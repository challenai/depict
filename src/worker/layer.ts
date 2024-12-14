import type { DrawableOptions, Mesh, MeshSpecificOptions, Text, TextSpecificOptions } from "@physical/drawable";
import { Renderer } from "@physical/render";
import { initializeContext } from "@physical/context";
import { BinaryEventHandler } from "./events";
import type { ShadowElement } from "./element";

export interface LayerOptions {
  renderer: Renderer;
  meshOptions: MeshSpecificOptions;
  textOptions: TextSpecificOptions;
  drawableOptions: DrawableOptions;
  update: boolean;
}

export class Layer {
  // layer index
  idx: number;
  // canvas
  canvas: OffscreenCanvas;
  // canvas context
  ctx: OffscreenCanvasRenderingContext2D;

  // render queue to store all the layer elements
  queue: ShadowElement[];
  // previous elements set
  prev: Set<ShadowElement>;
  // current frame elements set
  next: Set<ShadowElement>;

  // should we update the elements before render ?
  update: boolean;
  // whether the layer should be rerendered ?
  dirty: boolean;
  // element counter to produce index, to provide sequential layout in event trigger
  counter: number;

  // default renderer when not specified
  dr: Renderer;
  dmo: MeshSpecificOptions;
  dto: TextSpecificOptions;
  ddo: DrawableOptions;

  // width of the graph
  w: number;
  // height of the graph
  h: number;

  evClick: BinaryEventHandler;
  evMouseUp: BinaryEventHandler;
  evMouseDown: BinaryEventHandler;
  evActive: BinaryEventHandler;
  evMove: BinaryEventHandler;

  constructor(
    idx: number,
    canvas: OffscreenCanvas,
    {
      renderer,
      meshOptions,
      textOptions,
      drawableOptions,
      update,
    }: LayerOptions
  ) {
    this.idx = idx;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    this.queue = [];
    this.prev = new Set();
    this.next = new Set();

    this.update = update;
    this.dirty = true;
    this.counter = 0;

    this.dr = renderer;
    this.dmo = meshOptions;
    this.dto = textOptions;
    this.ddo = drawableOptions;

    initializeContext(this.ctx, this.dmo, this.dto, this.ddo);

    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.evClick = new BinaryEventHandler();
    this.evMouseUp = new BinaryEventHandler();
    this.evMouseDown = new BinaryEventHandler();
    this.evActive = new BinaryEventHandler();
    this.evMove = new BinaryEventHandler();
  }

  // update elements in queue before render
  private updateElements(delta: number) {
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
  buildElementEvents(element: ShadowElement) { }

  triggerEvents() { }

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
  updateQueue(element: ShadowElement[]) { }
}