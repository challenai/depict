export interface GraphOptions {
  root: HTMLDivElement;
  width: number;
  height: number;
};

export class Graph {
  root: HTMLElement;
  layers: HTMLCanvasElement[];
  x: number;
  y: number;

  constructor({
    root,
    width,
    height,
  }: GraphOptions) {
    this.root = root;
    this.layers = [];

    const rect = this.root.getClientRects().item(0);
    this.x = rect ? rect.x : 0;
    this.y = rect ? rect.y : 0;
  }
}