import type { EventType } from "./types";

export interface MsgInit {
  layers: OffscreenCanvas[];
};

export interface MsgEvent {
  typ: EventType;
  x: number;
  y: number;
};
