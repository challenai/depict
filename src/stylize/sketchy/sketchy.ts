import type { ResolvedOptions, Drawable, OpSet } from 'roughjs/bin/core';
import { RoughGenerator } from "roughjs/bin/generator";
import { randomSeed } from "roughjs/bin/math";
import type { TextContextBuilder } from "@physical/context";
import type { Mesh, Text } from "@physical/drawable";
import { Renderer } from "@physical/render";

// TODO: extra rough options
export interface MinimalistOptions {
  textContextBuilder: TextContextBuilder;
}

// sketchy renderer provide sketchy style wire frame to draw
export class SketchyRenderer extends Renderer {
  tcb: TextContextBuilder;
  gen: RoughGenerator;
  seed: number;

  constructor(opts: MinimalistOptions) {
    super();
    this.seed = randomSeed();
    this.tcb = opts.textContextBuilder;
    this.gen = new RoughGenerator();
  };

  draw(ctx: CanvasRenderingContext2D, mesh: Mesh) {
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

  // TODO: sketchy style text + default fonts?
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

  drawRough(ctx: CanvasRenderingContext2D, drawable: Drawable): void {
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

  private fillSketch(ctx: CanvasRenderingContext2D, drawing: OpSet, o: ResolvedOptions) {
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

  private _drawToContext(ctx: CanvasRenderingContext2D, drawing: OpSet, fixedDecimals?: number, rule: CanvasFillRule = 'nonzero') {
    ctx.beginPath();
    for (const item of drawing.ops) {
      const data = ((typeof fixedDecimals === 'number') && fixedDecimals >= 0) ? (item.data.map((d) => +d.toFixed(fixedDecimals))) : item.data;
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