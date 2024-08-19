/**
 * TODO: is it necessary to add x, y to Mesh?
 */

// mesh is the basic render unit
export interface Mesh {
  path: string;
  seed?: number;
};

// mesh style options
export interface MeshOptions {
  renderer?: string;
  stroke?: string;
  fill?: string;
  rotation?: number;
}

// Text is all the text shown in our art
export interface Text {
  x: number;
  y: number;
  content: string;
};

// text style options
export interface TextOptions {
  maxWidth?: number;
  color?: string;
  size?: number;
  family?: string;
}