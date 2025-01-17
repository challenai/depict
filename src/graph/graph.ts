import { Layer, type LayerOptions } from "./layer";
import { MinimalistRenderer } from "../stylize/minimallist/minimallist";
import { buildMeshContext, buildTextContext } from "../physical/context";
import type { Renderer } from "../physical/render";
import type { ShadowElement } from "./element";
import { MessageType, type CanvasEvent } from "../defs/types";

/**
 * preHandle runs before all events.
 * 
 * if you want to catch the event and do something before the graph get the event,
 * 
 * use it if you return true, the event **will not** be passed to graph.
 * 
 * @param {CanvasEvent} typ the type of the event
 * 
 * @param {number} x the position x of the event
 * 
 * @param {number} y the position y of the event
 * 
 * @return {boolean} the stop the event if true.
 * 
 * **Example Usage**
 * 
 * ```jsx
 * graph.preHandle = (typ, x, y) => {
 *   console.log("event happens at position: ", x, y);
 *   return false;
 * }
 * ```
 */
export type EventPreHandler = (typ: CanvasEvent, x: number, y: number) => boolean;

/**
 * postHandle runs before all events.
 * 
 * use it if you want to catch the event and do something after the graph handle the event,
 * 
 * if you return true, the event **will not** be passed to graph.
 * 
 * @param triggered triggered is used to tell you if the event has triggered some elements in the graphy
 * 
 * @param typ the type of the event
 * 
 * @param x the position x of the event
 * 
 * @param y the position y of the event
 * 
 * **Example Usage**
 * 
 * ```jsx
 * graph.postHandle = (triggered, typ, x, y) => {
 *   console.log("event happens at position: ", x, y);
 * }
 * ```
 */
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
 * graph.destroy();
 * ```
 */
export class Graph {
  // the layers of the graph
  private layers: Layer[];

  // animation handle
  private looping: number;

  /**
   * overall graph offset x
   * 
   * the graph will render according this delta x.
   */
  dx: number;

  /**
   * overall graph offset y, 
   * 
   * the graph will render according this delta y.
   */
  dy: number;

  /**
   * preHandle runs before all events.
   * 
   * if you want to catch the event and do something before the graph get the event,
   * 
   * use it if you return true, the event **will not** be passed to graph.
   * 
   * @param {CanvasEvent} typ the type of the event
   * 
   * @param {number} x the position x of the event
   * 
   * @param {number} y the position y of the event
   * 
   * @return {boolean} the stop the event if true.
   * 
   * **Example Usage**
   * 
   * ```jsx
   * graph.preHandle = (typ, x, y) => {
   *   console.log("event happens at position: ", x, y);
   *   return false;
   * }
   * ```
   */
  preHandle: EventPreHandler | null;

  /**
   * postHandle runs before all events.
   * 
   * use it if you want to catch the event and do something after the graph handle the event,
   * 
   * if you return true, the event **will not** be passed to graph.
   * 
   * @param triggered triggered is used to tell you if the event has triggered some elements in the graphy
   * 
   * @param typ the type of the event
   * 
   * @param x the position x of the event
   * 
   * @param y the position y of the event
   * 
   * **Example Usage**
   * 
   * ```jsx
   * graph.postHandle = (triggered, typ, x, y) => {
   *   console.log("event happens at position: ", x, y);
   * }
   * ```
   */
  postHandle: EventPostHandler | null;

  constructor() {
    this.layers = [];
    this.looping = -1;
    this.dx = 0;
    this.dy = 0;
    this.preHandle = null;
    this.postHandle = null;
  }

  /**
   * initialize the graph
   * 
   * if you use graph.handleMessageEvent, the graph life cycle will be controlled by events automatically, not need to intialize munually.
   */
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

  /**
   * resize the graph
   * 
   * if you use graph.handleMessageEvent, the graph life cycle will be controlled by events automatically, not need to resize munually.
   */
  resize(w: number, h: number) {
    for (const layer of this.layers) {
      layer.resize(w, h);
    }
    this.renderAll();
  }

  /**
   * trigger the events
   * 
   * if you use graph.handleMessageEvent, the graph life cycle will be controlled by events automatically, not need to triggerEvent munually.
   */
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

  /**
   * start the graph
   * 
   * if you use graph.handleMessageEvent, the graph life cycle will be controlled by events automatically, not need to start graph munually.
   */
  start() {
    this.loopFrame(0);
  }


  /**
   * update elements render queue of a specific layer
   * 
   * if you want to update a part of this layer, you can update only a part of some elements of a specific layer.
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
   * reset elements render queue of a specific layer
   * 
   * if you want to draw a whole new layer, you can reset the layer with a group of new elements
   * 
   * the only difference with `updateQueue` is that it could be a bit faster.
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
   * graph.resetQueue(0, [node]);
   * ```
   */
  resetQueue(layer: number, elements: ShadowElement[]) {
    if (layer < 0 || layer >= this.layers.length) return;
    this.layers[layer].resetQueue(elements);
  }

  /**
   * reset the whole graph
   * 
   * if you want to draw a whole new graph, you can reset all the layers
   * 
   * you can still reuse the previous elements.
   * 
   * if you don't specify the elements of the specific layer, the layer will be reset empty.
   * 
   * @param elements an arraylist of new layers.
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
   * graph.resetGraph([[node]]);
   * // the second layer will be empty since we don't provide the elements of second layer.
   * ```
   */
  resetGraph(elements: ShadowElement[][]) {
    if (!elements || elements.length > this.layers.length) return;
    this.layers.forEach((layer, idx) => {
      if (idx >= elements.length) {
        layer.resetQueue([]);
        return;
      }
      layer.resetQueue(elements[idx]);
    });
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

  /**
   * destroy the graph
   * 
   * if you use graph.handleMessageEvent, the graph life cycle will be controlled by events automatically, not need to destroy munually.
   * 
   * **Example Usage**
   * 
   * ```jsx
   * graph.destroy();
   * ```
   */
  destroy() {
    // release all the offscreen canvas memory
    this.layers.length = 0;
    cancelAnimationFrame(this.looping);
  }

  /**
   * handleMessageEvent handles messages from main thread.
   * 
   * @param {MessageEvent} ev the message event
   * 
   * @return {boolean} does the given event could been handled by this function? the user defined events can't be handled automatically
   * 
   * **Example Usage**
   * 
   * ```jsx
   * const graph = new Graph();
   * 
   * onmessage = (ev: MessageEvent) => {
   *   if (graph.handleMessageEvent(ev)) return;
   * }
   * ```
   */
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
