/**
 * canvas message type
*/
export enum MessageType {
  /**
   * initialize graph
  */
  INIT = -1,
  /**
   * destory graph
  */
  DESTROY = -2,
  /**
   * graph event
  */
  EVENT = -3,
  /**
   * resize graph
  */
  RESIZE = -4,
};

/**
 * browser dom event type
*/
export enum CanvasEvent {
  /**
   * mouse click
  */
  CLICK = -1,
  /**
   * mouse move
  */
  MOUSE_MOVE = -2,
  /**
   * mouse up
  */
  MOUSE_UP = -3,
  /**
   * mouse down
  */
  MOUSE_DOWN = -4,
}