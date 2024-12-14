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
}

export class Layer {
  // layer index
  idx: number;
  // canvas
  canvas: OffscreenCanvas;
  // canvas context
  ctx: OffscreenCanvasRenderingContext2D;
  // default renderer when not specified
  dr: Renderer;
  dmo: MeshSpecificOptions;
  dto: TextSpecificOptions;
  ddo: DrawableOptions;

  w: number;
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
      drawableOptions
    }: LayerOptions
  ) {
    this.idx = idx;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

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

  updateQueue() { }

  renderQueue() { }

  // build events trigger for a single given element
  buildElementEvents(element: ShadowElement) { }

  triggerEvents() { }

  private draw(x: number, y: number, elements?: ShadowElement[]) { }

  // run an extra render callback hook after an element finished its draw for pathes and texts
  postRender() { }

  // reset the render queue to render from scratch, if a group of new elements are given.
  // on this way, we don't compare to find the difference, instead, we destory all the built events, rebuild from scratch
  resetQueue(element: ShadowElement[]) { }
}