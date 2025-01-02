import { Layer, type LayerOptions } from "./layer";
import { MinimalistRenderer } from "../stylize/minimallist/minimallist";
import { buildMeshContext, buildTextContext } from "../physical/context";
import type { Renderer } from "../physical/render";
import type { ShadowElement } from "./element";
import { MessageType, type CanvasEvent } from "../defs/types";

export type EventPreHandler = (typ: CanvasEvent, x: number, y: number) => boolean;

export type EventPostHandler = (triggered: boolean, typ: CanvasEvent, x: number, y: number) => void;

/**
 * Graph hold all your shapes, it could run in the worker thread.
 * 
 * It could be used to draw any styles of graph, a chart, or a diagram, or even an interactive button with only a single layer.
 * 
 * The graph could be either simple event-driven or state-driven, or even a combination of both.
 * 
 * since it only depends on the canvas API, it could be used in any popular framework like React, Vue, Angular, or even vanilla JS.
 *
 * **Example Usage**
 * 
 * in web worker style, the graph will run in another thread,
 * 
 * and you don't need to handle the life cycle of the graph:
 * 
 * ```jsx
 * const graph = new Graph();
 * 
 * // worker thread listen to the message event.
 * onmessage = (ev) => {
 *   graph.handleMessageEvent(ev);
 * };
 * ```
 * 
 * directly run the graph in your main thread style: (currently not recommended)
 * 
 * you need to munually handle the life cycle of the graph.
 * 
 * ```jsx
 * const graph = new Graph();
 * 
 * // initialize the graph with layers and size.
 * graph.initialize(layers, width, height);
 * 
 * // you need to destroy the graph when you don't need it anymore.
 * graph.destory();
 * ```
 */
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


  /**
   * update elements render queue of a specific layer
   * 
   * if you want to draw another graph, you can set up a group of new elements of a specific layer.
   * 
   * @param layer layer to update, for exmaple, to update the second layer, you should pass 1.
   * 
   * @param elements an arraylist of elements to render for the next frame.
   * 
   * **Example Usage**
   * 
   * ```jsx
   * const node = {
   *   x: 24,
   *   y: 36,
   *     shapes: [{
   *       path: "M 20 20 l 0 100",
   *       opts: {
   *         stroke: "#666",
   *         fill: "#333",
   *     }],
   * };
   * graph.updateQueue(0, [node]);
   * ```
   */
  updateQueue(layer: number, elements: ShadowElement[]) {
    if (layer < 0 || layer >= this.layers.length) return;
    this.layers[layer].updateQueue(elements);
  }

  /**
   * update layer options of a specific layer
   * 
   * @param layer layer to update, for exmaple, to update the second layer, you should pass 1.
   * 
   * @param options layer options to update
   * 
   * **Example Usage**
   * 
   * ```jsx
   * graph.updateLayerOptions(1, { dynamic: true, update: true });
   * ```
   */
  updateLayerOptions(layer: number, options: LayerOptions) {
    if (layer < 0 || layer >= this.layers.length) return;
    this.layers[layer].updateOptions(options);
  }

  /**
   * ask for rerendering a specific layer
   * 
   * for example, rerender the second layer.
   * 
   * @param layer layer to rerender, for exmaple, to render to second layer, you should pass 1.
   * 
   * **Example Usage**
   * 
   * ```jsx
   * graph.render(1);
   * ```
   */
  render(layer: number) {
    if (layer < 0 || layer >= this.layers.length) return;
    this.layers[layer].render();
  }

  /**
   * ask for rerendering all layers(the whole graph)
   * 
   * **Example Usage**
   * 
   * ```jsx
   * graph.renderAll();
   * ```
   */
  renderAll() {
    for (const layer of this.layers) {
      layer.render();
    }
  }

  // destroy the graph
  destroy() {
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
      case MessageType.DESTROY:
        this.destroy();
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
