import type { Mesh, Text, TextRect } from './drawable';

/**
 * Renderer render meshes and write texts
*/
export abstract class Renderer {
  /**
   * draw meshes to the graph
  */
  abstract draw(ctx: OffscreenCanvasRenderingContext2D, shape: Mesh): void
  /**
   * write texts to the graph
  */
  abstract write(ctx: OffscreenCanvasRenderingContext2D, text: Text): void
  /**
   * get bounding box of the text
  */
  abstract boundingBox(ctx: OffscreenCanvasRenderingContext2D, text: Text): TextRect
};