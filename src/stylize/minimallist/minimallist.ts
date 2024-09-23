import type { Mesh, MeshOptions, Text, TextOptions } from "@physical/drawable";
import { Renderer } from "@physical/render";

export interface MinimalistOptions {
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

// minimalist renderer provide basic wire frame to draw,
// it will draw our shapes as fast as possible.
export class MinimalistRenderer extends Renderer {
  dmo: MeshOptions;
  dto: TextOptions;

  constructor(opts: MinimalistOptions) {
    super();
    this.dmo = opts.defaultMeshOpts || DMO;
    this.dto = opts.defaultTextOpts || DTO;
  };

  draw(ctx: CanvasRenderingContext2D, mesh: Mesh) {
    ctx.save();
    const opts = mesh.opts;

    // set current mesh offset
    const x = mesh.x || 0;
    const y = mesh.y || 0;
    if (x != 0 && y != 0) ctx.translate(x, y);

    // create 2D path
    const p2d = new Path2D(mesh.path);

    // set stroke style
    if (opts && opts.stroke) {
      ctx.strokeStyle = opts.stroke;
    } else {
      ctx.strokeStyle = "#000";
    }

    ctx.stroke(p2d);

    // fill the mesh
    if (opts && opts.fill) {
      ctx.fillStyle = opts.fill;
      ctx.fill(p2d);
    }

    ctx.restore();
  };

  write(ctx: CanvasRenderingContext2D, text: Text) {
    ctx.save();
    const opts = text.opts || {};

    // set text offset
    const x = text.x || 0;
    const y = text.y || 0;
    // write text
    ctx.fillStyle = opts.color || (DTO.color as string);
    const sz = opts.size || DTO.size;
    const family = opts.family || DTO.family;
    ctx.font = `${sz}pt ${family}`;

    ctx.fillText(text.content, x, y);

    ctx.restore();
  };
};