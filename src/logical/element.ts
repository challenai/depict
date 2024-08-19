import type { Mesh, Text } from "@physical/drawable";

export interface ShadowElement {
  id: string;
  x: number;
  y: number;
  shapes: Mesh[];
  text?: Text;
  children?: ShadowElement[];
};
