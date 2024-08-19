// mesh is the basic render unit
export interface Mesh {
  path: string;
  seed?: number;
};

export interface Options {
  renderer?: string;
  stroke?: string;
  fill?: string;
  rotation?: number;
}

// Text is all the text shown
export interface Text {
  x: number;
  y: number;
  content: string;
};

export interface Options {
  maxWidth?: number;
  color?: string;
  size?: number;
  family?: string;
}