import type { Layer } from "./layer";

export class Graph {
  // TODO: 1. add offset API
  // TODO: 2. events trigger
  // TODO: 3. impl initialize/destory process
  // TODO: 4. design and impl events hooks
  // TODO: 5. user self-coustomed messages from main thread
  // the layers of the graph
  layers: Layer[];

  constructor() {
    this.layers = [];
  }

  initializeGraph() { }

  triggerEvent() { }

  private renderLayers(delta: number) {
    for (const l of this.layers) {
      if (!l.dirty) return;
      l.updateElements(delta)
      l.renderQueue(0, 0);
    }
  }

  destory() { }
}
