import type { CanvasEvent } from "./types";

export interface MsgInit {
  layers: OffscreenCanvas[];
};

export interface MsgEvent {
  typ: CanvasEvent;
  x: number;
  y: number;
};

export interface MsgResize {
  w: number
  h: number
};