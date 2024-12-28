import type { MeshContextBuilder, TextContextBuilder } from "../../physical/context";
import type { Mesh, Text } from "../../physical/drawable";
import { Renderer } from "../../physical/render";
import { cutLastLine, seperateText2MultiLines } from "../../physical/text";

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

  draw(ctx: OffscreenCanvasRenderingContext2D, mesh: Mesh) {
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

  write(ctx: OffscreenCanvasRenderingContext2D, text: Text) {
    ctx.save();
    // text border: default value == false
    const border = text.opts?.border;
    // fill the text, default value == true
    const fill = !text.opts || text.opts.background !== false || text.opts.fill;

    const caculateWidth = (text: string, start: number, end?: number) => {
      return ctx.measureText(text.substring(start, end)).width;
    };

    if (text.opts) this.tcb(ctx, text.opts);

    if (!text.opts || !text.opts.height || !text.opts.width) {
      let content = text.content;
      if (text.opts && text.opts.width) {
        content = cutLastLine(text.content, text.opts.width, 0, caculateWidth, text.opts.wordBased, text.opts.ellipsis);
      }
      if (border) ctx.strokeText(content, text.x || 0, text.y || 0);
      if (fill) ctx.fillText(content, text.x || 0, text.y || 0);
      ctx.restore();
      return;
    }

    const width = text.opts.width;
    const height = text.opts.height;
    const lineHeight = text.opts?.lineHeight || 18;


    // lines to render
    let lines: string[];
    if (text._state && text._state.t === text.content && !text.opts.relayout) {
      lines = text._state.ls;
    } else {
      const cacheContent = text.content.slice();
      const targetLines = this.estimateLines(lineHeight, height);
      lines = seperateText2MultiLines(cacheContent, width, caculateWidth, targetLines, text.opts.wordBased, text.opts.ellipsis);
      text._state = { t: cacheContent, ls: lines };
    }

    let y = text.y || 0;
    for (let ln of lines) {
      if (border) ctx.strokeText(ln, text.x || 0, y);
      if (fill) ctx.fillText(ln, text.x || 0, y);
      y += lineHeight;
    }

    ctx.restore();
  };

  // estimate how many lines should it wraps.
  // TODO: optional inner padding ?
  private estimateLines(lh: number, mh: number): number {
    if (mh < lh) return 0;

    return Math.floor(mh / lh);
  }
};