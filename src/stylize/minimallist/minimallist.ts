import type { MeshContextBuilder, TextContextBuilder } from "@physical/context";
import type { Mesh, Text } from "@physical/drawable";
import { Renderer } from "@physical/render";

export interface MinimalistOptions {
  meshContextBuilder: MeshContextBuilder;
  textContextBuilder: TextContextBuilder;
}

// minimalist renderer provide basic wire frame to draw,
// it will draw our shapes as fast as possible.
export class MinimalistRenderer extends Renderer {
  mcb: MeshContextBuilder;
  tcb: TextContextBuilder;

  constructor(opts: MinimalistOptions) {
    super();
    this.mcb = opts.meshContextBuilder;
    this.tcb = opts.textContextBuilder;
  };

  draw(ctx: CanvasRenderingContext2D, mesh: Mesh) {
    ctx.save();
    if (mesh.opts) this.mcb(ctx, mesh.opts);

    // set current mesh offset
    const x = mesh.x || 0;
    const y = mesh.y || 0;
    if (x != 0 || y != 0) ctx.translate(x, y);

    // create 2D path
    const p2d = new Path2D(mesh.path);
    // border: default value == true
    if (!mesh.opts || mesh.opts?.border != false || mesh.opts.stroke) ctx.stroke(p2d);

    // fill the mesh, default value == false
    if (mesh.opts?.background || mesh.opts?.fill) ctx.fill(p2d);

    ctx.restore();
  };

  write(ctx: CanvasRenderingContext2D, text: Text) {
    ctx.save();
    if (text.opts) this.tcb(ctx, text.opts);

    const maxWidth = text.opts?.maxWidth || undefined;

    // border: default value == false
    if (text.opts?.border) ctx.strokeText(text.content, text.x || 0, text.y || 0, maxWidth);

    // fill the text, default value == true
    if (!text.opts || text.opts.background !== false || text.opts.fill) ctx.fillText(text.content, text.x || 0, text.y || 0, maxWidth);

    ctx.restore();
  };
};