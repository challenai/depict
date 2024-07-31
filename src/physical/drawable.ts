// mesh is the basic render unit
export interface Mesh {
  path: string;
  stroke?: string;
  fill?: string;
  rotation?: number;
  renderer?: string;
  seed?: number;
};

// Text is all the text shown
export interface Text {
  x: number;
  y: number;
  maxWidth: number;
  content: string;
  color: string;
  size: number;
  family: string;
};