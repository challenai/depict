import type { Mesh, Text } from "@physical/drawable";
import type { Renderer } from "@physical/render";

export enum NodeType {
  DYNAMIC = 0,
  EVENT = 1,
  STATIC = 2,
};

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
  contain?: (x: number, y: number) => void;
  // specify renderer for this element
  renderer?: Renderer;
  // node type of current node, only for performance tuning
  type?: NodeType;
  // animation
  animate?: (self: ShadowElement, delta: number) => void;
};