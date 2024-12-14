export interface DepictOptions {
  root: HTMLDivElement;
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

  constructor({
    root,
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

  run() { }
}