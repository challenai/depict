import type {
  DrawableOptions,
  MeshOptions,
  MeshSpecificOptions,
  TextOptions,
  TextSpecificOptions,
} from "./drawable";

/**
 * InitializeContextBuilder, build all context
 */
export type InitializeContextBuilder = (
  ctx: OffscreenCanvasRenderingContext2D,
  mo: MeshOptions,
  to: TextOptions,
  o: DrawableOptions,
) => void;

/**
 * MeshContextBuilder, build mesh context
 */
export type MeshContextBuilder = (
  ctx: OffscreenCanvasRenderingContext2D,
  mo: MeshOptions,
) => void;

/**
 * TextContextBuilder, build text context
 */
export type TextContextBuilder = (
  ctx: OffscreenCanvasRenderingContext2D,
  to: TextOptions,
) => void;

/**
 * build global options for context
 */
export const initializeContext: InitializeContextBuilder = (
  ctx: OffscreenCanvasRenderingContext2D,
  mo: MeshSpecificOptions,
  to: TextSpecificOptions,
  o: DrawableOptions,
) => {
  buildMeshContext(ctx, mo);
  buildTextContext(ctx, to);
  buildDrawableContext(ctx, o);
};

/**
 * default mesh context builder
 */
export const buildMeshContext: MeshContextBuilder = (
  ctx: OffscreenCanvasRenderingContext2D,
  o: MeshOptions,
) => {
  for (const key in o) {
    let handled = false;
    switch (key) {
      case "lineWidth":
        ctx.lineWidth = Number(o.lineWidth);
        handled = true;
        break;
      case "lineCap":
        ctx.lineCap = o.lineCap as CanvasLineCap;
        handled = true;
        break;
      case "lineJoin":
        ctx.lineJoin = o.lineJoin as CanvasLineJoin;
        handled = true;
        break;
      case "miterLimit":
        ctx.miterLimit = Number(o.miterLimit);
        handled = true;
        break;
    }
    if (!handled) buildDrawableContextWithKey(ctx, o, key);
  }
};

/**
 * default text context builder
 */
export const buildTextContext: TextContextBuilder = (
  ctx: OffscreenCanvasRenderingContext2D,
  o: TextOptions,
) => {
  for (const key in o) {
    let handled = false;
    switch (key) {
      case "font":
        ctx.font = String(o.font);
        handled = true;
        break;
      case "textAlign":
        ctx.textAlign = o.textAlign as CanvasTextAlign;
        handled = true;
        break;
      case "textBaseline":
        ctx.textBaseline = o.textBaseline as CanvasTextBaseline;
        handled = true;
        break;
    }
    if (!handled) buildDrawableContextWithKey(ctx, o, key);
  }
};

/**
 * default drawable context builder
 */
const buildDrawableContext = (
  ctx: OffscreenCanvasRenderingContext2D,
  o: DrawableOptions,
) => {
  for (const key in o) {
    buildDrawableContextWithKey(ctx, o, key);
  }
};

/**
 * build drawable context with key
 */
const buildDrawableContextWithKey = (
  ctx: OffscreenCanvasRenderingContext2D,
  o: DrawableOptions,
  key: string,
): boolean => {
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
