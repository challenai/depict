import type { CanvasEvent } from "./types";

export interface MsgInit {
  layers: OffscreenCanvas[];
  size: MsgSize;
  background?: OffscreenCanvas;
};

export interface MsgEvent {
  typ: CanvasEvent;
  x: number;
  y: number;
};

export interface MsgSize {
  w: number;
  h: number;
  scale: number;
};