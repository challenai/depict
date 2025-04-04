import type {
  MeshContextBuilder,
  TextContextBuilder,
} from "../../physical/context";
import type { Mesh, Text, TextRect } from "../../physical/drawable";
import { Renderer } from "../../physical/render";
import { cutLastLine, seperateText2MultiLines } from "../../physical/text";

/**
 * MinimalistRenderer options
 */
export interface MinimalistOptions {
  /**
   * provide a mesh context builder to initialize the renderer
   */
  meshContextBuilder: MeshContextBuilder;
  /**
   * provide a text context builder to initialize the renderer
   */
  textContextBuilder: TextContextBuilder;
}

/**
 * MinimalistRenderer provide basic wire frame to draw,
 *
 * it will draw our shapes as fast as possible.
 */
export class MinimalistRenderer extends Renderer {
  mcb: MeshContextBuilder;
  tcb: TextContextBuilder;

  constructor(opts: MinimalistOptions) {
    super();
    this.mcb = opts.meshContextBuilder;
    this.tcb = opts.textContextBuilder;
  }

  /**
   * draw meshes to the graph
   */
  draw(ctx: OffscreenCanvasRenderingContext2D, mesh: Mesh) {
    ctx.save();
    this._draw(ctx, mesh);
    ctx.restore();
  }

  private _draw(ctx: OffscreenCanvasRenderingContext2D, mesh: Mesh) {
    if (mesh.opts) this.mcb(ctx, mesh.opts);

    // set current mesh offset
    const x = mesh.x || 0;
    const y = mesh.y || 0;
    if (x !== 0 || y !== 0) ctx.translate(x, y);

    // create 2D path
    const p2d = new Path2D(mesh.path);
    // border: default value == true
    if (!mesh.opts || mesh.opts?.border !== false || mesh.opts.stroke)
      ctx.stroke(p2d);

    // fill the mesh, default value == false
    if (mesh.opts?.background || mesh.opts?.fill) ctx.fill(p2d);
  }

  /**
   * get bounding box of the text
   */
  boundingBox(ctx: OffscreenCanvasRenderingContext2D, text: Text): TextRect {
    ctx.save();
    const r = this._boundingBox(ctx, text);
    ctx.restore();
    return r;
  }

  private _boundingBox(
    ctx: OffscreenCanvasRenderingContext2D,
    text: Text,
  ): TextRect {
    const lineHeight = text.opts?.lineHeight || 18;
    if (text.opts) this.tcb(ctx, text.opts);
    this.layout(ctx, text, lineHeight);

    const lines = text._state.ls;
    if (lines.length === 1) {
      return {
        width: ctx.measureText(lines[0]).width,
        height: lineHeight,
      };
    }
    return {
      width: text._state.w,
      height: text._state.h,
    };
  }

  private layout(
    ctx: OffscreenCanvasRenderingContext2D,
    text: Text,
    lineHeight: number,
  ) {
    if (
      text._state &&
      text._state.t === text.content &&
      (!text.opts || !text.opts.relayout)
    )
      return;

    const caculateWidth = (text: string, start: number, end?: number) => {
      return ctx.measureText(text.substring(start, end)).width;
    };

    const cacheContent = text.content.slice();
    if (!text.opts || !text.opts.height || !text.opts.width) {
      let content = text.content;
      if (text.opts?.width) {
        content = cutLastLine(
          text.content,
          text.opts.width,
          0,
          caculateWidth,
          text.opts.wordBased,
          text.opts.ellipsis,
        );
      }
      text._state = { t: cacheContent, ls: [content], w: 0, h: 0 };
      return;
    }

    const width = text.opts.width;
    const height = text.opts.height;

    const targetLines = this.estimateLines(lineHeight, height);
    const lines = seperateText2MultiLines(
      cacheContent,
      width,
      caculateWidth,
      targetLines,
      text.opts.wordBased,
      text.opts.ellipsis,
    );
    text._state = {
      t: cacheContent,
      ls: lines,
      w: width,
      h: lineHeight * lines.length,
    };
  }

  /**
   * write texts to the graph
   */
  write(ctx: OffscreenCanvasRenderingContext2D, text: Text) {
    ctx.save();
    this._write(ctx, text);
    ctx.restore();
  }

  private _write(ctx: OffscreenCanvasRenderingContext2D, text: Text) {
    const lineHeight = text.opts?.lineHeight || 18;
    if (text.opts) this.tcb(ctx, text.opts);
    this.layout(ctx, text, lineHeight);

    // text border: default value == false
    const border = text.opts?.border;
    // fill the text, default value == true
    const fill = !text.opts || text.opts.background !== false || text.opts.fill;

    // lines to render
    const lines = text._state.ls;
    let y = text.y || 0;
    for (const ln of lines) {
      if (border) ctx.strokeText(ln, text.x || 0, y);
      if (fill) ctx.fillText(ln, text.x || 0, y);
      y += lineHeight;
    }
  }

  // estimate how many lines should it wraps.
  // TODO: optional inner padding ?
  private estimateLines(lh: number, mh: number): number {
    if (mh < lh) return 0;

    return Math.floor(mh / lh);
  }
}
