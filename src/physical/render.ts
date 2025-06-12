import type { Mesh, Text, TextRect } from "./drawable";

/**
 * Abstract base class for renderers that handle drawing meshes and writing texts.
 * Implementations must provide methods for drawing shapes, writing text, and
 * calculating text bounding boxes.
 */
export abstract class Renderer {
  /**
   * Draw a mesh shape to the canvas context.
   * @param ctx - The rendering context.
   * @param shape - The mesh to draw.
   */
  abstract draw(ctx: OffscreenCanvasRenderingContext2D, shape: Mesh): void;

  /**
   * Write text to the canvas context.
   * @param ctx - The rendering context.
   * @param text - The text object to render.
   */
  abstract write(ctx: OffscreenCanvasRenderingContext2D, text: Text): void;

  /**
   * Calculate the bounding box of the given text.
   * @param ctx - The rendering context.
   * @param text - The text object to measure.
   * @returns The bounding rectangle of the text.
   */
  abstract boundingBox(
    ctx: OffscreenCanvasRenderingContext2D,
    text: Text,
  ): TextRect;
}
