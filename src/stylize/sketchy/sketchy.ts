import type { Mesh, MeshOptions, Text, TextOptions } from "@physical/drawable";
import { Renderer } from "@physical/render";

export interface SketchyOptions {
  defaultMeshOpts?: MeshOptions;
  defaultTextOpts?: TextOptions;
}

const DMO: MeshOptions = {
  stroke: "#000",
  fill: undefined,
  rotation: undefined,
};

const DTO: TextOptions = {
  maxWidth: undefined,
  color: "#000",
  size: 14,
  family: undefined
};

// sketchy renderer provide sketchy style wire frame to draw
export class SketchyRenderer extends Renderer {
  ctx: CanvasRenderingContext2D;
  dmo: MeshOptions;
  dto: TextOptions;

  constructor(opts: SketchyOptions) {
    super();
    this.ctx = ctx;
    this.dmo = opts.defaultMeshOpts || DMO;
    this.dto = opts.defaultTextOpts || DTO;
  };

  draw(ctx: CanvasRenderingContext2D, mesh: Mesh) {
    // TODO
  };

  // TODO: sketchy style text + default fonts?
  write(ctx: CanvasRenderingContext2D, text: Text) {
    // set text offset
    const x = text.x || 0;
    const y = text.y || 0;
    // write text
    this.ctx.fillText(text.content, x, y);
  };
}