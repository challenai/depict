import type { Mesh, Text } from "../physical/drawable";
import type { Renderer } from "../physical/render";

export type RenderHooksFn = (ctx: OffscreenCanvasRenderingContext2D) => void;

export type UpdateFn = (self: ShadowElement, delta: number) => void;

export type RenderLayer = (layer?: number) => void;

export interface RuntimeState {
  idx: number;
  dx: number;
  dy: number;
  liftUp?: boolean;
  destory?: boolean;
};

// ShadowElement is the basic unit which stores shapes and texts
// it contains a children property so that it is organized as a tree
export interface ShadowElement {
  // offset x
  x: number;
  // offset y
  y: number;
  // set absolute postioning to current element
  absolute?: boolean;
  // hide current element
  hidden?: boolean;
  // current element is just copied pointer which actually lives in a different layer
  layerUp?: boolean;
  // shapes of current element
  shapes?: Mesh[];
  // texts of current element
  texts?: Text[];
  // children list of current element
  children?: ShadowElement[];
  // if current element contains the given coordination
  contain?: (x: number, y: number) => boolean;
  // specify renderer for this element
  renderer?: Renderer;
  // update hook
  update?: UpdateFn;
  // render hook
  postRenderCallback?: RenderHooksFn;
  // handle event: click
  onClick?: (self: ShadowElement, render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => boolean;
  // handle event: mouse enter
  onMouseenter?: (self: ShadowElement, render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => boolean;
  // handle event: mouse leave
  onMouseleave?: (self: ShadowElement, render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => boolean;
  // handle event: mouse up
  onMouseup?: (self: ShadowElement, render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => boolean;
  // handle event: mouse down
  onMousedown?: (self: ShadowElement, render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => boolean;
  // handle event: mouse move
  onMousemove?: (self: ShadowElement, render: RenderLayer, x: number, y: number, mouseX: number, mouseY: number) => boolean;
  // // TODO: decide if bounding box works
  // boundingBox?: number[];
  // user data
  data?: any;
  // internal state, not control by user
  _state?: RuntimeState;
}
