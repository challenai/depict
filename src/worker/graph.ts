import type { MsgInit } from "@defs/messages";
import { Layer, type LayerOptions } from "./layer";
import { MinimalistRenderer } from "@stylize/minimallist/minimallist";
import { buildMeshContext, buildTextContext } from "@physical/context";
import type { Renderer } from "@physical/render";

export class Graph {
  // TODO: 1. add offset API
  // TODO: 2. events trigger
  // TODO: 3. impl initialize/destory process
  // TODO: 4. design and impl events hooks
  // TODO: 5. user self-coustomed messages from main thread

  // the layers of the graph
  layers: Layer[];

  // animation handle
  looping: number;

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

  // render() {}

  destory() { }
}
