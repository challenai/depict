import type { Mesh, Text } from "@physical/drawable";

export interface ShadowElement {
  id: string;
  x: number;
  y: number;
  static: boolean;
  dirty: boolean;
  ms: Mesh[];
  t: Text | undefined;
  children: ShadowElement[];
};
