import type { Mesh, Text } from './drawable';

// Renderer render meshes and write texts
export abstract class Renderer {
  // draw meshes
  abstract draw(ctx: OffscreenCanvasRenderingContext2D, shape: Mesh): void
  // write texts
  abstract write(ctx: OffscreenCanvasRenderingContext2D, text: Text): void
};