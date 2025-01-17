import type { Mesh, Text } from "../physical/drawable";
import type { Renderer } from "../physical/render";

/**
 * RenderHooksFn is a render hook
 * 
 * @param ctx canvas context
 */
export type RenderHooksFn = (ctx: OffscreenCanvasRenderingContext2D) => void;

/**
 * UpdateFn runs updates before render
 * 
 * @param delta delta time from previous render, it's commonly used to animate.
 */
export type UpdateFn = (delta: number) => void;

/**
 * RenderLayer request render the given layer
 * 
 * @param layer specify the layer to render, if no layer was given, the whole graph will be rerender.
 */
export type RenderLayer = (layer?: number) => void;

/**
 * internal run time state of an element
*/
export interface RuntimeState {
  idx: number;
  dx: number;
  dy: number;
  liftUp?: boolean;
  destroy?: boolean;
};

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
  contain?: (x: number, y: number) => boolean;
  /**
   * specify renderer for this element,
   * 
   * if not specified, it will use the default minimal renderer,  
   * 
   * self customized renderer could be used to draw more complex shapes.
   */
  renderer?: Renderer;
  // update hook
  /**
   * update would be called before render,
   * 
   * it would be called before every render, if the update flag is turned on.
   * 
   * if rerender doesn't happen, the update hook will not be called.
   */
  update?: UpdateFn;
  /**
   * postRenderCallback would be called immediately after render a single node.
   * 
   * you can draw highly customized shapes, or images here.
   */
  postRenderCallback?: RenderHooksFn;
  /**
   * onClick would be called when the element is clicked.
   */
  onClick?: (render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => void;
  /**
   * onMouseenter would be called when the mouse enters the element.
   */
  onMouseenter?: (render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => void;
  /**
   * onMouseleave would be called when the mouse leaves the element.
   */
  onMouseleave?: (render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => void;
  /**
   * onMouseup would be called when the mouse up event is triggered.
   */
  onMouseup?: (render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => void;
  /**
   * onMousedown would be called when the mouse down event is triggered.
   */
  onMousedown?: (render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => void;
  /**
   * onMousemove would be called when the mouse move event is triggered.
   */
  onMousemove?: (render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => void;
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
