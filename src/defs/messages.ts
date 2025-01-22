import type { CanvasEvent } from "./types";

/**
 * browser dom event type
*/
export interface MsgInit {
  /**
   * layers of the graph
  */
  layers: OffscreenCanvas[];
  /**
   * size of the graph
  */
  size: MsgSize;
  /**
   * background canvas
  */
  background?: OffscreenCanvas;
};

/**
 * message content: graph event
*/
export interface MsgEvent {
  /**
   * type
  */
  typ: CanvasEvent;
  /**
   * x
  */
  x: number;
  /**
   * y
  */
  y: number;
};

/**
 * message content: size of the graph
*/
export interface MsgSize {
  /**
   * width
  */
  w: number;
  /**
   * height
  */
  h: number;
  /**
   * scale
  */
  scale: number;
};