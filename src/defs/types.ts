// canvas message type
export enum MessageType {
  INIT = -1,
  DESTROY = -2,
  EVENT = -3,
  RESIZE = -4,
};

// browser dom event type
export enum CanvasEvent {
  CLICK = -1,
  MOUSE_MOVE = -2,
  MOUSE_UP = -3,
  MOUSE_DOWN = -4,
}