import type { Mesh, MeshOptions, Text, TextOptions } from "@physical/drawable";
import { Renderer } from "@physical/render";

const MINIMALIST_RENDERER = "minimalist";

export interface MinimalistOptions {
  defaultMeshOpts?: MeshOptions;
  defaultTextOpts?: TextOptions;
}

const DMO: MeshOptions = {
  renderer: MINIMALIST_RENDERER,
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

// minimalist renderer provide basic wire frame to draw,
// it will draw our shapes as fast as possible.
export class MinimalistRenderer extends Renderer {
  ctx: CanvasRenderingContext2D;
  dmo: MeshOptions;
  dto: TextOptions;

  constructor(ctx: CanvasRenderingContext2D, opts: MinimalistOptions) {
    super();
    this.ctx = ctx;
    this.dmo = opts.defaultMeshOpts || DMO;
    this.dto = opts.defaultTextOpts || DTO;
  };

  draw(mesh: Mesh) {
    this.ctx.save();
    const opts = mesh.opts;

    // set current mesh offset
    const x = mesh.x || 0;
    const y = mesh.y || 0;
    if (x != 0 && y != 0) this.ctx.translate(x, y);

    // create 2D path
    const p2d = new Path2D(mesh.path);

    // set stroke style
    if (opts && opts.stroke) {
      this.ctx.strokeStyle = opts.stroke;
    } else {
      this.ctx.strokeStyle = "#000";
    }

    this.ctx.stroke(p2d);

    // fill the mesh
    if (opts && opts.fill) {
      this.ctx.fillStyle = opts.fill;
      this.ctx.fill(p2d);
    }

    this.ctx.restore();
  };

  write(text: Text) {
    // set text offset
    const x = text.x || 0;
    const y = text.y || 0;
    // write text
    this.ctx.fillText(text.content, x, y);
  };

  offset(x: number, y: number) {
    this.ctx.translate(x, y);
  };
};