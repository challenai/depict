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
  // options
  opts?: MeshOptions;
};

// shared style options
export interface DrawableOptions {
  // need to draw border
  border?: boolean;
  // need to draw background
  background?: boolean;
  // canvas stroke style
  stroke?: string;
  // canvas fill color or pattern
  fill?: string;
  // rotation in degrees
  rotation?: number;
  // scale factor
  scale?: number;
  // shadow
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

// mesh style options
export interface MeshOptions extends MeshSpecificOptions, DrawableOptions { };

export interface MeshSpecificOptions {
  // line width of mesh
  lineWidth?: number;
  lineCap?: string;
  lineJoin?: string;
  miterLimit?: number;
}

// Text is all the text shown in our art
export interface Text {
  // text content
  content: string;
  // offset x
  x?: number;
  // offset y
  y?: number;
  // options
  opts?: TextOptions;
  // internal state
  _state?: any;
};

// TextRect is the rect size of a given text
export interface TextRect {
  width: number;
  height: number;
};

// text style options
export interface TextOptions extends TextSpecificOptions, DrawableOptions { };

export interface TextSpecificOptions {
  // max width of given text, the extra words whould be thrown away
  width?: number;
  // max height of the text, if the height is given, the lines could be wrap
  height?: number;
  // line height of the text
  lineHeight?: number;
  // font of text
  font?: string;
  // tell the graph the user want the text to caculate layout again
  relayout?: boolean;
  // ellipsis
  ellipsis?: boolean;
  // seperate according to words instead of letter
  wordBased?: boolean;
}