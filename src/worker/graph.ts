import type { MsgInit } from "@defs/messages";
import { Layer, type LayerOptions } from "./layer";
import { MinimalistRenderer } from "@stylize/minimallist/minimallist";
import { buildMeshContext, buildTextContext } from "@physical/context";
import type { Renderer } from "@physical/render";
import type { ShadowElement } from "./element";

export class Graph {
  // TODO: 1. add offset API
  // TODO: 2. events trigger
  // TODO: 3. impl initialize/destory process
  // TODO: 4. design and impl events hooks
  // TODO: 5. user self-coustomed messages from main thread

  // the layers of the graph
  private layers: Layer[];

  // animation handle
  private looping: number;

  // overall offset of the graph
  dx: number;
  dy: number;

  constructor() {
    this.layers = [];
    this.looping = -1;
    this.dx = 0;
    this.dy = 0;
  }

  initialize({ layers }: MsgInit) {
    const defaultRenderer: Renderer = new MinimalistRenderer({
      meshContextBuilder: buildMeshContext,
      textContextBuilder: buildTextContext,
    });
    for (const canvas of layers) {
      const layer = new Layer(canvas, defaultRenderer);
      this.layers.push(layer);
    }
  }

  triggerEvent() { }

  private renderLayers(delta: number) {
    for (const l of this.layers) {
      if (!l.dirty) return;
      l.updateElements(delta)
      l.renderQueue(0, 0);
    }
  }

  // update elements of a specific layer
  updateQueue(layer: number, elements: ShadowElement[]) {
    if (layer < 0 || layer >= this.layers.length) return;
    const layerPtr = this.layers[layer];
    layerPtr.updateQueue(elements);
  }

  // ask for rendering a specific layer
  render(layer: number) {
    if (layer < 0 || layer >= this.layers.length) return;
    const layerPtr = this.layers[layer];
    layerPtr.dirty = true;
  }

  // destory the graph
  destory() {
    // release all the offscreen canvas memory
    this.layers.length = 0;
    cancelAnimationFrame(this.looping);
  }
}
