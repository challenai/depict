/**
 * TODO: is it necessary to add x, y to Mesh?
 */

// mesh is the basic render unit
export interface Mesh {
  // path of the given mesh
  path: string;
  // prevent random generated shape from changing
  seed?: number;
  // offset x
  x?: number;
  // offset y
  y?: number;
};

// mesh style options
export interface MeshOptions {
  // selected randerer
  renderer?: string;
  // canvas stroke of given mesh
  stroke?: string;
  // fill color or pattern into mesh
  fill?: string;
  // rotation in degrees
  rotation?: number;
}

// Text is all the text shown in our art
export interface Text {
  // text content
  content: string;
  // offset x
  x?: number;
  // offset y
  y?: number;
};

// text style options
export interface TextOptions {
  // max width of given text, the extra ones whould be throw
  maxWidth?: number;
  // color of text
  color?: string;
  // size of text
  size?: number;
  // font family of text
  family?: string;
}