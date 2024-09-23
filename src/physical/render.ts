import type { Mesh, Text } from './drawable';

// Renderer render meshes and write texts
export abstract class Renderer {
  // draw meshes
  abstract draw(ctx: CanvasRenderingContext2D, shape: Mesh): void
  // write texts
  abstract write(ctx: CanvasRenderingContext2D, text: Text): void
};