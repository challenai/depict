import type { DrawableOptions, MeshOptions, MeshSpecificOptions, TextOptions, TextSpecificOptions } from './drawable';

export type InitializeContextBuilder = (ctx: CanvasRenderingContext2D, mo: MeshOptions, to: TextOptions, o: DrawableOptions) => void;

export type MeshContextBuilder = (ctx: CanvasRenderingContext2D, mo: MeshOptions) => void;

export type TextContextBuilder = (ctx: CanvasRenderingContext2D, to: TextOptions) => void;

// build global options for context
export const initializeContext: InitializeContextBuilder = (ctx: CanvasRenderingContext2D, mo: MeshSpecificOptions, to: TextSpecificOptions, o: DrawableOptions) => {
  buildMeshContext(ctx, mo);
  buildTextContext(ctx, to);
  buildDrawableContext(ctx, o);
}

// default mesh context builder
export const buildMeshContext: MeshContextBuilder = (ctx: CanvasRenderingContext2D, o: MeshOptions) => {
  for (const key in o) {
    const match = buildDrawableContextWithKey(ctx, o, key);
    if (match) continue;
    switch (key) {
      case "lineWidth":
        ctx.lineWidth = o.lineWidth as any;
        break;
      case "lineCap":
        ctx.lineCap = o.lineCap as any;
        break;
      case "lineJoin":
        ctx.lineJoin = o.lineJoin as any;
        break;
      case "miterLimit":
        ctx.miterLimit = o.miterLimit as any;
        break;
    }
  }
};

// default text context builder
export const buildTextContext: TextContextBuilder = (ctx: CanvasRenderingContext2D, o: TextOptions) => {
  for (const key in o) {
    if (key === "font") {
      ctx.font = o.font as any;
      continue;
    }
    buildDrawableContextWithKey(ctx, o, key);
  }
};

// default drawable context builder
const buildDrawableContext = (ctx: CanvasRenderingContext2D, o: DrawableOptions) => {
  for (const key in o) {
    buildDrawableContextWithKey(ctx, o, key);
  }
};

const buildDrawableContextWithKey = (ctx: CanvasRenderingContext2D, o: DrawableOptions, key: string): boolean => {
  switch (key) {
    case "stroke":
      ctx.strokeStyle = o.stroke as any;
      return true;
    case "fill":
      ctx.fillStyle = o.fill as any;
      return true;
    case "rotation":
      ctx.rotate(o.rotation as number);
      return true;
    case "scale":
      ctx.scale(o.scale as number, o.scale as number);
      return true;
    case "shadowColor":
      ctx.shadowColor = o.shadowColor as any;
      return true;
    case "shadowBlur":
      ctx.shadowBlur = o.shadowBlur as any;
      return true;
    case "shadowOffsetX":
      ctx.shadowOffsetX = o.shadowOffsetX as any;
      return true;
    case "shadowOffsetY":
      ctx.shadowOffsetY = o.shadowOffsetY as any;
      return true;
  }
  return false;
};