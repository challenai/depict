import type { Mesh, Text } from "../physical/drawable";
import type { Renderer } from "../physical/render";

/**
 * RenderHook could run before/after/during render
 *
 * @param ctx canvas context
 *
 * @param offscreen a shared offscreen canvas among different elements
 */
export type RenderHook = (
  ctx: OffscreenCanvasRenderingContext2D,
  offscreen?: OffscreenCanvas,
) => void;

/**
 * MouseEventHandler handles mouse events
 */
export type MouseEventHandler = (
  render: RenderLayer,
  x: number,
  y: number,
  mouseX: number,
  mouseY: number,
) => void;

/**
 * UpdateFn runs updates before render
 *
 * @param timestamp timestamp from the beginning, it's commonly used to animate the graph.
 */
export type UpdateHook = (timestamp: number) => void;

/**
 * RenderLayer request render the given layer
 *
 * @param layer specify the layer to render, if no layer was given, the whole graph will be rerender.
 */
export type RenderLayer = (layer?: number) => void;

/**
 * ContainCallback decides whether the coordinates inside the graph
 *
 * @param x x axis position
 *
 * @param y y axis position
 *
 * @returns whether the coordinates inside the graph ?
 */
export type ContainCallback = (x: number, y: number) => boolean;

/**
 * internal run time state of an element
 */
export interface RuntimeState {
  idx: number;
  dx: number;
  dy: number;
  liftUp?: boolean;
  destroy?: boolean;
}

/**
 * ShadowElement is the basic unit where stores shapes and texts
 *
 * It contains a children property so that it is organized as a tree
 *
 * **Example Usage**
 *
 * ```jsx
 * const element: ShadowElement = {
 *   x: 24,
 *   y: 36,
 *   shapes: [{
 *     path: "M 20 20 l 0 100",
 *     opts: {
 *       stroke: "#666",
 *       fill: "#333",
 *   }],
 * };
 * ```
 */
export interface ShadowElement {
  /**
   * offset x
   */
  x: number;
  /**
   * offset y
   */
  y: number;
  /**
   * set absolute postioning to current element
   */
  absolute?: boolean;
  /**
   * hide current element
   */
  hidden?: boolean;
  /**
   * current element is just copied pointer which actually lives in a different layer
   */
  layerUp?: boolean;
  /**
   * shapes of current element
   */
  shapes?: Mesh[];
  /**
   * texts of current element
   */
  texts?: Text[];
  /**
   * children arraylist of current element
   */
  children?: ShadowElement[];
  /**
   * if current element contains the given coordination ?
   *
   * it's used for event handling.
   */
  contain?: ContainCallback;
  /**
   * specify renderer for this element,
   *
   * if not specified, it will use the default minimal renderer,
   *
   * self customized renderer could be used to draw more complex shapes.
   */
  renderer?: Renderer;
  /**
   * update would be called before render,
   *
   * it would be called before every render, if the update flag is turned on.
   *
   * if rerender doesn't happen, the update hook will not be called.
   */
  update?: UpdateHook;
  /**
   * postRenderCallback would be called immediately after render a single node.
   *
   * you can draw highly customized shapes, or images here.
   */
  postRenderCallback?: RenderHook;
  /**
   * onClick would be called when the element is clicked.
   */
  onClick?: MouseEventHandler;
  /**
   * onMouseenter would be called when the mouse enters the element.
   */
  onMouseenter?: MouseEventHandler;
  /**
   * onMouseleave would be called when the mouse leaves the element.
   */
  onMouseleave?: MouseEventHandler;
  /**
   * onMouseup would be called when the mouse up event is triggered.
   */
  onMouseup?: MouseEventHandler;
  /**
   * onMousedown would be called when the mouse down event is triggered.
   */
  onMousedown?: MouseEventHandler;
  /**
   * onMousemove would be called when the mouse move event is triggered.
   */
  onMousemove?: MouseEventHandler;
  // TODO: decide if bounding box works
  // boundingBox?: number[];
  /**
   * data could be used to store any user-defined data, typically used for state management.
   */
  data?: any;
  /**
   * _state is the internal run time state of the element,
   *
   * it should **not** controlled by the user.
   *
   * so **never** modify it.
   *
   * it's used to cache some computed results to speed up the rendering and event handling process.
   */
  _state?: RuntimeState;
}
