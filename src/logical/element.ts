import type { Mesh, Text } from "@physical/drawable";

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
};
