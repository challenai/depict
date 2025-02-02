/**
 * mesh is the basic render unit
*/
export interface Mesh {
  /**
   * path of the given mesh
  */
  path: string;
  /**
   * prevent random generated shape from changing
  */
  seed?: number;
  /**
   * offset x
  */
  x?: number;
  /**
   * offset y
  */
  y?: number;
  /**
   * mesh options
  */
  opts?: MeshOptions;
};

/**
 * shared style options
*/
export interface DrawableOptions {
  /**
   * need to draw border ?
  */
  border?: boolean;
  /**
   * need to draw background ?
  */
  background?: boolean;
  /**
   * canvas stroke style
  */
  stroke?: string;
  /**
   * canvas fill color or pattern
  */
  fill?: string;
  /**
   * rotation in radian
  */
  rotation?: number;
  /**
   * scale factor
  */
  scale?: number;
  /**
   * the color of shadow
  */
  shadowColor?: string;
  /**
   * the blur of shadow
  */
  shadowBlur?: number;
  /**
   * the offset x of shadow
  */
  shadowOffsetX?: number;
  /**
   * the offset y of shadow
  */
  shadowOffsetY?: number;
}

/**
 * mesh style options
*/
export interface MeshOptions extends MeshSpecificOptions, DrawableOptions { };

/**
 * mesh related options
*/
export interface MeshSpecificOptions {
  /**
   * line width of mesh
  */
  lineWidth?: number;
  /**
   * line cap of mesh
  */
  lineCap?: string;
  /**
   * line join of mesh
  */
  lineJoin?: string;
  /**
   * miter limit of mesh
  */
  miterLimit?: number;
}

/**
 * Text is all the text shown in our art
*/
export interface Text {
  /**
   * text content
  */
  content: string;
  /**
   * offset x
  */
  x?: number;
  /**
   * offset y
  */
  y?: number;
  /**
   * options
  */
  opts?: TextOptions;
  /**
   * internal state to speed up render,
   * 
   * never modify it munually
  */
  _state?: any;
};

/**
 * TextRect is the rect size of a given text
*/
export interface TextRect {
  /**
   * width of the text
  */
  width: number;
  /**
   * height of the text
  */
  height: number;
};

/**
 * text style options
*/
export interface TextOptions extends TextSpecificOptions, DrawableOptions { };

/**
 * text related options
*/
export interface TextSpecificOptions {
  /**
   * max width of given text, the extra words whould be thrown away
  */
  width?: number;
  /**
   * max height of the text,
   * 
   * if the height is given, the text could be wrap to multilines.
  */
  height?: number;
  /**
   * line height of the text
  */
  lineHeight?: number;
  /**
   * font of text, to set font weight, font family and font size
  */
  font?: string;
  /**
   * horizontal align of text: start, end, center, left, right
  */
  textAlign?: string;
  /**
   * vertical align of text: alphabetic, top, hanging, middle, ideographic, bottom
  */
  textBaseline?: string;
  /**
   * tell the graph the user want the text to caculate layout again
  */
  relayout?: boolean;
  /**
   * ellipsis overflow text
  */
  ellipsis?: boolean;
  /**
   * seperate according to words instead of letter
  */
  wordBased?: boolean;
}