import type { MsgEvent, MsgInit } from "@defs/messages";
import { Layer, type LayerOptions } from "./layer";
import { MinimalistRenderer } from "@stylize/minimallist/minimallist";
import { buildMeshContext, buildTextContext } from "@physical/context";
import type { Renderer } from "@physical/render";
import type { ShadowElement } from "./element";
import type { CanvasEvent } from "@defs/types";

export type EventPreHandler = (typ: CanvasEvent, x: number, y: number) => boolean;

export type EventPostHandler = (triggered: boolean, typ: CanvasEvent, x: number, y: number) => void;

export class Graph {
  // the layers of the graph
  private layers: Layer[];

  // animation handle
  private looping: number;

  // overall offset of the graph
  dx: number;
  dy: number;

  preHandle: EventPreHandler | null;
  postHandle: EventPostHandler | null;

  constructor() {
    this.layers = [];
    this.looping = -1;
    this.dx = 0;
    this.dy = 0;
    this.preHandle = null;
    this.postHandle = null;
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

  triggerEvent({ typ, x, y }: MsgEvent) {
    let stopFlag = false;
    if (this.preHandle) stopFlag = this.preHandle(typ, x, y);
    if (stopFlag) return;

    let triggered = false;
    for (let i = this.layers.length - 1; i >= 0; i--) {
      triggered = this.layers[i].triggerEvent(typ, this.render.bind(this), x, y);
      if (triggered) break;
    }

    if (this.postHandle) this.postHandle(triggered, typ, x, y);
  }

  private renderLayers(delta: number) {
    // store the current (dx, dy) to promise all the layer share a single offset coordinates
    const cdx = this.dx;
    const cdy = this.dy;
    for (const layer of this.layers) {
      if (layer.shouldRender()) {
        layer.updateElements(delta)
        layer.renderQueue(cdx, cdy);
      }
    }
  }

  private loopFrame(delta: number) {
    this.renderLayers(delta);
    this.looping = requestAnimationFrame(this.loopFrame.bind(this));
  }

  // start the graph
  start() {
    this.loopFrame(0);
  }

  // update elements of a specific layer
  updateQueue(layer: number, elements: ShadowElement[]) {
    if (layer < 0 || layer >= this.layers.length) return;
    this.layers[layer].updateQueue(elements);
  }

  updateLayerOptions(layer: number, options: LayerOptions) {
    if (layer < 0 || layer >= this.layers.length) return;
    this.layers[layer].updateOptions(options);
  }

  // ask for rendering a specific layer
  render(layer: number) {
    if (layer < 0 || layer >= this.layers.length) return;
    this.layers[layer].render();
  }

  // ask for rendering all layers, the whole graph
  renderAll() {
    for (const layer of this.layers) {
      layer.render();
    }
  }

  // destory the graph
  destory() {
    // release all the offscreen canvas memory
    this.layers.length = 0;
    cancelAnimationFrame(this.looping);
  }
}
