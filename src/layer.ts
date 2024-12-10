import type { DrawableOptions, Mesh, MeshSpecificOptions, Text, TextSpecificOptions } from "@physical/drawable";
import { Renderer } from "./physical/render";
import { initializeContext } from "@physical/context";

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
  }
}