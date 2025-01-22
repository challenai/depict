import type { Mesh, Text, TextRect } from './drawable';

// Renderer render meshes and write texts
export abstract class Renderer {
  // draw meshes
  abstract draw(ctx: OffscreenCanvasRenderingContext2D, shape: Mesh): void
  // write texts
  abstract write(ctx: OffscreenCanvasRenderingContext2D, text: Text): void
  // bounding box
  abstract boundingBox(ctx: OffscreenCanvasRenderingContext2D, text: Text): TextRect
};