import type { DrawableOptions, Mesh, MeshSpecificOptions, Text, TextSpecificOptions } from "../physical/drawable";
import { Renderer } from "../physical/render";
import { initializeContext } from "../physical/context";
import { BinaryEventHandler } from "./events";
import type { ShadowElement } from "./element";
import { CanvasEvent } from "../defs/types";

export type ExplicitRenderLayer = (layer: number) => void;

/**
 * layer options
 */
export interface LayerOptions {
  renderer?: Renderer;
  meshOptions?: MeshSpecificOptions;
  textOptions?: TextSpecificOptions;
  drawableOptions?: DrawableOptions;
  update?: boolean;
  dynamic?: boolean;
}

export class Layer {
  // canvas
  private canvas: OffscreenCanvas;
  // canvas context
  private ctx: OffscreenCanvasRenderingContext2D;

  // render queue to store all the layer elements
  private queue: ShadowElement[];
  // previous elements set
  private prev: Set<ShadowElement>;
  // current frame elements set
  private next: Set<ShadowElement>;

  // should we update the elements before render ?
  private update: boolean;
  // whether the layer should be rerendered ?
  private dirty: boolean;
  // whether the layer should be rerendered each time ?
  private dynamic: boolean;
  // element counter to produce index, to provide sequential layout in event trigger
  private counter: number;

  // default renderer when not specified
  private dr: Renderer;
  private dmo: MeshSpecificOptions;
  private dto: TextSpecificOptions;
  private ddo: DrawableOptions;

  // width of the graph
  private w: number;
  // height of the graph
  private h: number;

  private evClick: BinaryEventHandler;
  private evMouseUp: BinaryEventHandler;
  private evMouseDown: BinaryEventHandler;
  private evActive: BinaryEventHandler;
  private evMove: BinaryEventHandler;

  private active: Set<ShadowElement>;

  constructor(
    canvas: OffscreenCanvas,
    defaultRenderer: Renderer,
    w: number,
    h: number,
    scale: number,
  ) {
    // canvas
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    // width and height
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * scale);
    this.canvas.height = Math.round(h * scale);
    this.ctx.scale(scale, scale);

    // elements
    this.queue = [];
    this.prev = new Set();
    this.next = new Set();

    // render context
    this.dr = defaultRenderer;
    this.dmo = {};
    this.dto = {};
    this.ddo = {};
    this.update = true;
    initializeContext(this.ctx, this.dmo, this.dto, this.ddo);

    // elements update
    this.dirty = true;
    this.dynamic = false;
    this.counter = 0;

    // events
    this.evClick = new BinaryEventHandler();
    this.evMouseUp = new BinaryEventHandler();
    this.evMouseDown = new BinaryEventHandler();
    this.evActive = new BinaryEventHandler();
    this.evMove = new BinaryEventHandler();

    // active elements
    this.active = new Set();
  }

  // update elements in queue before render
  updateElements(delta: number) {
    this.updateElementsInQueue(delta, this.queue);
  }

  private updateElementsInQueue(delta: number, elements?: ShadowElement[]) {
    if (!this.update || !elements) return;
    for (const element of elements) {
      if (element.update) element.update(delta)
      this.updateElementsInQueue(delta, element.children);
    }
  }

  // resize the layer
  resize(w: number, h: number, scale: number) {
    this.w = w;
    this.h = h;
    // reset the transform
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.canvas.width = Math.round(w * scale);
    this.canvas.height = Math.round(h * scale);
    this.ctx.scale(scale, scale);
  }

  // render elements at coordinates (x, y)
  renderQueue(x: number, y: number) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.counter = 0;
    this.ctx.translate(x, y);
    this.renderElements(x, y, this.queue);
    this.ctx.translate(-x, -y);
    this.dirty = false;
    for (const el of this.prev) {
      if (el._state) el._state.destroy = true;
    }
    this.prev = this.next;
    this.next = new Set();
  }

  // build events trigger for a single given element
  private buildElementEvents(element: ShadowElement) {
    if (!element.contain) return;
    if (element.onClick) {
      this.evClick.add(element);
    }
    if (element.onMouseup) {
      this.evMouseUp.add(element);
    }
    if (element.onMousedown) {
      this.evMouseDown.add(element);
    }
    if (element.onMouseenter || element.onMouseleave) {
      this.evActive.add(element);
    }
    if (element.onMousemove) {
      this.evMove.add(element);
    }
  }

  // try to trigger given event
  triggerEvent(typ: CanvasEvent, renderLayer: ExplicitRenderLayer, x: number, y: number): boolean {
    const renderLayerDefault = (layer?: number) => {
      if (layer === undefined) {
        this.render();
      } else {
        renderLayer(layer);
      }
    };
    let element: ShadowElement | null;
    switch (typ) {
      case CanvasEvent.CLICK:
        element = this.evClick.trigger(x, y);
        if (element && element.onClick) {
          element.onClick(renderLayerDefault, element._state!.dx, element._state!.dy, x, y);
          return true;
        }
        return false;
      case CanvasEvent.MOUSE_UP:
        element = this.evMouseUp.trigger(x, y);
        if (element && element.onMouseup) {
          element.onMouseup(renderLayerDefault, element._state!.dx, element._state!.dy, x, y);
          return true;
        }
        return false;
      case CanvasEvent.MOUSE_DOWN:
        element = this.evMouseDown.trigger(x, y);
        if (element && element.onMousedown) {
          element.onMousedown(renderLayerDefault, element._state!.dx, element._state!.dy, x, y);
          return true;
        }
        return false;
      case CanvasEvent.MOUSE_MOVE:
        const els = this.evMove.elements;
        for (const element of els) {
          if (element.onMousemove) {
            element.onMousemove(renderLayerDefault, element._state!.dx, element._state!.dy, x, y);
          }
        }

        // mouse enter and leave
        const actives = this.evActive.triggerAll(x, y);
        const activesSet = new Set(actives);
        for (const element of this.active) {
          if (element._state?.destroy) continue;
          if (element.onMouseleave && !activesSet.has(element)) {
            element.onMouseleave(renderLayerDefault, element._state!.dx, element._state!.dy, x, y);
          }
        }
        for (const element of activesSet) {
          if (element.onMouseenter && !this.active.has(element)) {
            element.onMouseenter(renderLayerDefault, element._state!.dx, element._state!.dy, x, y);
          }
        }
        this.active = activesSet;
        return false;
    }
    return false;
  }

  // render a group of elements with given (x, y)
  private renderElements(x: number, y: number, elements?: ShadowElement[]) {
    if (!elements) return;
    for (const el of elements) {
      // check internal _state
      this.counter++
      if (!el._state) el._state = { idx: this.counter, dx: x, dy: y };
      if (el._state.destroy) el._state.destroy = false;
      if (el.hidden) continue;
      this.next.add(el);

      // build events for current element
      if (this.prev.has(el)) {
        this.prev.delete(el);
      } else {
        this.buildElementEvents(el);
      }
      this.next.add(el);

      const r = el.renderer || this.dr;

      // caculate the offset for the current element
      let dx = x + el.x;
      let dy = y + el.y;
      let tx = el.x;
      let ty = el.y;
      if (el.layerUp) {
        if (el._state.liftUp) {
          // shift parent element
          dx = el._state.dx || 0 + el.x;
          dy = el._state.dy || 0 + el.y;
          tx = dx - x;
          ty = dy - y;
        } else {
          // save the (x, y) in current layer as offset for the next layer
          el._state.liftUp = true;
          continue;
        }
      }
      if (el.shapes || el.texts || el.postRenderCallback) {
        this.ctx.translate(tx, ty);
        el.shapes?.forEach((m: Mesh) => r.draw(this.ctx, m));
        el.texts?.forEach((t: Text) => r.write(this.ctx, t));
        if (el.postRenderCallback) this.postRender(el.postRenderCallback);
        this.renderElements(dx, dy, el.children);
        this.ctx.translate(-tx, -ty);
      }
    }
  }

  // run an extra render callback hook after an element finished its draw for pathes and texts
  private postRender(callback: (ctx: OffscreenCanvasRenderingContext2D) => void) {
    this.ctx.save();
    callback(this.ctx);
    this.ctx.restore();
  }

  // reset the render queue to render from scratch, if a group of new elements are given.
  // on this way, we don't compare to find the difference, instead, we destroy all the built events, rebuild from scratch
  updateQueue(elements: ShadowElement[]) {
    this.queue = elements;
    // this.next.clear();
    this.dirty = true;
  }

  // reset the whole queue for a new group of elements
  // destroy all the current elements directly.
  resetQueue(elements: ShadowElement[]) {
    this.uninstallEvents();
    this.prev.clear();
    this.next.clear();
    this.queue = elements;
    this.dirty = true;
  }

  uninstallEvents() {
    this.evClick.clear();
    this.evMouseUp.clear();
    this.evMouseDown.clear();
    this.evActive.clear();
    this.evMove.clear();
    this.active.clear();
  }

  // update layer options to turn on/off some function flags or change base styles.
  updateOptions(options: LayerOptions) {
    if (options.renderer) this.dr = options.renderer;
    if (options.meshOptions) this.dmo = options.meshOptions;
    if (options.textOptions) this.dto = options.textOptions;
    if (options.drawableOptions) this.ddo = options.drawableOptions;

    if (typeof options.update === "boolean") this.update = options.update;
    if (typeof options.dynamic === "boolean") this.dynamic = options.dynamic;

    if (options.meshOptions || options.textOptions || options.drawableOptions) {
      initializeContext(this.ctx, this.dmo, this.dto, this.ddo);
    }
  }

  // should this layer rerender now ?
  shouldRender(): boolean {
    return this.dynamic || this.dirty;
  }

  // ask for rendering current layer
  render() {
    if (this.shouldRender()) return;
    this.dirty = true;
  }
}