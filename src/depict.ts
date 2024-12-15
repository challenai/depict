export interface DepictOptions {
  width: number;
  height: number;
};

// TODO: listen resize event
// TODO: support dynamic layers?
// TODO: init
export class Depict {
  // root element to hold graph
  root: HTMLElement;
  // canvas layers
  layers: HTMLCanvasElement[];
  // dom posistion of current graph
  x: number;
  y: number;
  // minimum event trigger interval
  mei: number;

  constructor(
    root: HTMLDivElement,
    {
      width,
      height,
    }: DepictOptions) {
    this.root = root;
    this.layers = [];
    this.mei = 16;

    const rect = this.root.getClientRects().item(0);
    this.x = rect ? rect.x : 0;
    this.y = rect ? rect.y : 0;
  }

  private setupCanvas(
    canvas: HTMLCanvasElement,
    w: number,
    h: number,
    base: boolean,
  ) {
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    if (!base) {
      canvas.style.backgroundColor = "transparent";
    }
  }

  run() { }
}