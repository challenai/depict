import { Layer, type LayerOptions } from "./layer";
import { MinimalistRenderer } from "../stylize/minimallist/minimallist";
import { buildMeshContext, buildTextContext } from "../physical/context";
import type { Renderer } from "../physical/render";
import type { ShadowElement } from "./element";
import { MessageType, type CanvasEvent } from "../defs/types";

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

  initialize(layers: OffscreenCanvas[], w: number, h: number) {
    const defaultRenderer: Renderer = new MinimalistRenderer({
      meshContextBuilder: buildMeshContext,
      textContextBuilder: buildTextContext,
    });
    for (const canvas of layers) {
      const layer = new Layer(canvas, defaultRenderer, w, h);
      this.layers.push(layer);
    }
  }

  resize(w: number, h: number) {
    for (const layer of this.layers) {
      layer.resize(w, h);
    }
    this.renderAll();
  }

  triggerEvent(typ: CanvasEvent, x: number, y: number) {
    let stopFlag = false;
    if (this.preHandle) stopFlag = this.preHandle(typ, x, y);
    if (stopFlag) return;

    const dx = this.dx;
    const dy = this.dy;

    let triggered = false;
    for (let i = this.layers.length - 1; i >= 0; i--) {
      triggered = this.layers[i].triggerEvent(typ, this.render.bind(this), x - dx, y - dy);
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

  handleMessageEvent(ev: MessageEvent): boolean {
    const eventType = ev.data.type;
    const msg = ev.data.msg;
    switch (eventType) {
      case MessageType.INIT:
        this.initialize(msg.layers, msg.size.w, msg.size.h);
        this.start();
        return true;
      case MessageType.DESTORY:
        this.destory();
        return true;
      case MessageType.EVENT:
        this.triggerEvent(msg.typ, msg.x, msg.y);
        return true;
      case MessageType.RESIZE:
        this.resize(msg.w, msg.h);
        return true;
    };
    return false;
  }
}
