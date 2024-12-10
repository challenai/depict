import type { DrawableOptions, Mesh, MeshSpecificOptions, Text, TextSpecificOptions } from "@physical/drawable";
import { Renderer } from "./physical/render";

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
  }
}