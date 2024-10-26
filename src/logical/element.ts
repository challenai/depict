import type { Mesh, Text } from "@physical/drawable";
import type { Renderer } from "@physical/render";

export enum NodeType {
  // dynamic node will redraw per frame, it's an animation and relatively expensive.
  DYNAMIC = 0,
  // event based node, the node can be modified when some events are triggered.
  EVENT = 1,
  // static node will never redraw.
  STATIC = 2,
  // current node is static, but contains dynamic or event based children.
  HYBRID = 3,
}

export type RenderHooksFn = (ctx: CanvasRenderingContext2D) => void;

// ShadowElement is the basic unit which stores shapes and texts
// it contains a children property so that it is organized as a tree
export interface ShadowElement {
  // unique id of current element
  id: string;
  // offset x
  x: number;
  // offset y
  y: number;
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
  // node type of current node, only for performance tuning
  type?: NodeType;
  // render hook
  preRenderCallback?: RenderHooksFn;
  // animation
  animate?: (self: ShadowElement, delta: number) => void;
  // handle event: click
  onClick?: (self: ShadowElement, x: number, y: number) => void;
  // handle event: mouse enter
  onMouseenter?: (self: ShadowElement, x: number, y: number) => void;
  // handle event: mouse leave
  onMouseleave?: (self: ShadowElement, x: number, y: number) => void;
  // handle event: mouse up
  onMouseup?: (self: ShadowElement, x: number, y: number) => void;
  // handle event: mouse down
  onMousedown?: (self: ShadowElement, x: number, y: number) => void;
  // handle event: mouse move
  onMousemove?: (self: ShadowElement, x: number, y: number) => void;
  // // TODO: decide if bounding box works
  // boundingBox?: number[];
  // user data
  data?: any;
  // hide current element
  hidden?: boolean;
  // delete the current element
  destory?: boolean;
  // internal state, not control by user
  _state?: any;
}
