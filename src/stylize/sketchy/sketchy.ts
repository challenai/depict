import type { ResolvedOptions, Drawable, OpSet } from 'roughjs/bin/core';
import { RoughGenerator } from "roughjs/bin/generator";
import { randomSeed } from "roughjs/bin/math";
import type { TextContextBuilder } from "../../physical/context";
import type { Mesh, Text, TextRect } from "../../physical/drawable";
import { Renderer } from "../../physical/render";
import { cutLastLine, seperateText2MultiLines } from '../../physical/text';

// TODO: extra rough options
export interface SketchyOptions {
  textContextBuilder: TextContextBuilder;
}

// sketchy renderer provide sketchy style wire frame to draw
export class SketchyRenderer extends Renderer {
  tcb: TextContextBuilder;
  gen: RoughGenerator;
  seed: number;

  constructor(opts: SketchyOptions) {
    super();
    this.seed = randomSeed();
    this.tcb = opts.textContextBuilder;
    this.gen = new RoughGenerator();
  };

  draw(ctx: OffscreenCanvasRenderingContext2D, mesh: Mesh) {
    ctx.save();

    // set current mesh offset
    const x = mesh.x || 0;
    const y = mesh.y || 0;
    if (x != 0 || y != 0) ctx.translate(x, y);

    const d = this.gen.path(mesh.path, {
      ...mesh.opts,
      seed: this.seed,
    })

    this.drawRough(ctx, d)

    ctx.restore();
  };

  boundingBox(ctx: OffscreenCanvasRenderingContext2D, text: Text): TextRect {
    ctx.save();

    const lineHeight = text.opts?.lineHeight || 18;
    if (text.opts) this.tcb(ctx, text.opts);
    this.layout(ctx, text, lineHeight);

    ctx.restore();

    const lines = text._state.ls;
    if (lines.length === 1) {
      return {
        width: ctx.measureText(lines[0]).width,
        height: lineHeight,
      }
    }
    return {
      width: text._state.w,
      height: text._state.h,
    };
  }

  layout(ctx: OffscreenCanvasRenderingContext2D, text: Text, lineHeight: number) {
    if (text._state && text._state.t === text.content && (!text.opts || !text.opts.relayout)) return;

    const caculateWidth = (text: string, start: number, end?: number) => {
      return ctx.measureText(text.substring(start, end)).width;
    };

    const cacheContent = text.content.slice();
    if (!text.opts || !text.opts.height || !text.opts.width) {
      let content = text.content;
      let width: number;
      if (text.opts && text.opts.width) {
        width = text.opts.width;
        content = cutLastLine(text.content, text.opts.width, 0, caculateWidth, text.opts.wordBased, text.opts.ellipsis);
      }
      text._state = { t: cacheContent, ls: [content], w: 0, h: 0 };
      return;
    }

    const width = text.opts.width;
    const height = text.opts.height;

    const targetLines = this.estimateLines(lineHeight, height);
    const lines = seperateText2MultiLines(cacheContent, width, caculateWidth, targetLines, text.opts.wordBased, text.opts.ellipsis);
    text._state = { t: cacheContent, ls: lines, w: width, h: lineHeight * lines.length };
  };

  write(ctx: OffscreenCanvasRenderingContext2D, text: Text) {
    ctx.save();

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
    for (let ln of lines) {
      if (border) ctx.strokeText(ln, text.x || 0, y);
      if (fill) ctx.fillText(ln, text.x || 0, y);
      y += lineHeight;
    }

    ctx.restore();
  }

  // estimate how many lines should it wraps.
  // TODO: optional inner padding ?
  private estimateLines(lh: number, mh: number): number {
    if (mh < lh) return 0;

    return Math.floor(mh / lh);
  }

  drawRough(ctx: OffscreenCanvasRenderingContext2D, drawable: Drawable): void {
    const sets = drawable.sets || [];
    const o = drawable.options || this.gen.defaultOptions;
    const precision = drawable.options.fixedDecimalPlaceDigits;
    for (const drawing of sets) {
      switch (drawing.type) {
        case 'path':
          ctx.save();
          ctx.strokeStyle = o.stroke === 'none' ? 'transparent' : o.stroke;
          ctx.lineWidth = o.strokeWidth;
          if (o.strokeLineDash) {
            ctx.setLineDash(o.strokeLineDash);
          }
          if (o.strokeLineDashOffset) {
            ctx.lineDashOffset = o.strokeLineDashOffset;
          }
          this._drawToContext(ctx, drawing, precision);
          ctx.restore();
          break;
        case 'fillPath': {
          ctx.save();
          ctx.fillStyle = o.fill || '';
          const fillRule: CanvasFillRule = (drawable.shape === 'curve' || drawable.shape === 'polygon' || drawable.shape === 'path') ? 'evenodd' : 'nonzero';
          this._drawToContext(ctx, drawing, precision, fillRule);
          ctx.restore();
          break;
        }
        case 'fillSketch':
          this.fillSketch(ctx, drawing, o);
          break;
      }
    }
  }

  private fillSketch(ctx: OffscreenCanvasRenderingContext2D, drawing: OpSet, o: ResolvedOptions) {
    let fweight = o.fillWeight;
    if (fweight < 0) {
      fweight = o.strokeWidth / 2;
    }
    ctx.save();
    if (o.fillLineDash) {
      ctx.setLineDash(o.fillLineDash);
    }
    if (o.fillLineDashOffset) {
      ctx.lineDashOffset = o.fillLineDashOffset;
    }
    ctx.strokeStyle = o.fill || '';
    ctx.lineWidth = fweight;
    this._drawToContext(ctx, drawing, o.fixedDecimalPlaceDigits);
    ctx.restore();
  }

  private _drawToContext(ctx: OffscreenCanvasRenderingContext2D, drawing: OpSet, fixedDecimals?: number, rule: CanvasFillRule = 'nonzero') {
    ctx.beginPath();
    for (const item of drawing.ops) {
      const data = ((typeof fixedDecimals === 'number') && fixedDecimals >= 0) ? (item.data.map((d: number) => +d.toFixed(fixedDecimals))) : item.data;
      switch (item.op) {
        case 'move':
          ctx.moveTo(data[0], data[1]);
          break;
        case 'bcurveTo':
          ctx.bezierCurveTo(data[0], data[1], data[2], data[3], data[4], data[5]);
          break;
        case 'lineTo':
          ctx.lineTo(data[0], data[1]);
          break;
      }
    }
    if (drawing.type === 'fillPath') {
      ctx.fill(rule);
    } else {
      ctx.stroke();
    }
  }
};