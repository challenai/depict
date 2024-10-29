import type { Renderer } from "@physical/render";
import { type ShadowElement, NodeType } from "./element";
import type { DrawableOptions, Mesh, MeshOptions, MeshSpecificOptions, Text, TextOptions, TextSpecificOptions } from "@physical/drawable";
import { initializeContext } from "@physical/context";

// device ratio to adapt different device, prevent blur issue
const SCALE_FACTOR = window.devicePixelRatio;
const BLUR_OFFSET = -0.5;

export interface GraphOptions {
  root: HTMLDivElement;
  defaultRenderer: Renderer;
  width: number;
  height: number;
  animation: boolean;
  event: boolean;
  globalMeshOptions: MeshSpecificOptions;
  globalTextOptions: TextSpecificOptions;
  globalDrawableOptions: DrawableOptions;
}

// the internal graph
export class Graph {
  // canvas
  canvas: HTMLCanvasElement;
  // default renderer when not specified
  dr: Renderer;
  // hint for nodes update for the animations
  // update: boolean;
  // list of nodes
  elements: ShadowElement[];
  // tell if this graph contains animation
  animation: boolean;
  // tell if this graph needs to listen to events
  event: boolean;
  // tell if this graph is waiting to rerender for events
  evWaiting: boolean;
  // canvas context
  ctx: CanvasRenderingContext2D;
  // off-screen canvas to cache
  evCanvas: HTMLCanvasElement;
  evCtx: CanvasRenderingContext2D;
  // off-screen canvas to cache
  stCanvas: HTMLCanvasElement;
  stCtx: CanvasRenderingContext2D;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  focus: Set<ShadowElement>;
  gmo: MeshOptions;
  gto: TextOptions;
  gdo: DrawableOptions;

  constructor({
    root,
    defaultRenderer,
    width,
    height,
    event,
    animation,
    globalMeshOptions,
    globalTextOptions,
    globalDrawableOptions,
  }: GraphOptions) {
    this.x0 = BLUR_OFFSET;
    this.y0 = BLUR_OFFSET;
    this.x1 = width + BLUR_OFFSET;
    this.y1 = height + BLUR_OFFSET;
    this.x = 0;
    this.y = 0;

    this.gmo = globalMeshOptions;
    this.gto = globalTextOptions;
    this.gdo = globalDrawableOptions;

    this.canvas = document.createElement("canvas");
    root.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.initializeCanvas(this.canvas, this.ctx, width, height);
    this.stCanvas = this.canvas;
    this.stCtx = this.ctx;
    this.evCanvas = this.canvas;
    this.evCtx = this.ctx;

    if (animation || event) {
      this.stCanvas = document.createElement("canvas");
      this.stCtx = this.stCanvas.getContext("2d") as CanvasRenderingContext2D;
      this.initializeCanvas(this.stCanvas, this.stCtx, width, height);
    }

    if (event && animation) {
      this.evCanvas = document.createElement("canvas");
      this.evCtx = this.evCanvas.getContext("2d") as CanvasRenderingContext2D;
      this.initializeCanvas(this.evCanvas, this.evCtx, width, height);
    }

    this.dr = defaultRenderer;
    this.elements = [];
    this.animation = animation;
    this.event = event;
    // wait to render event frame during bootstrap
    this.evWaiting = true;

    this.focus = new Set();
    // if the global event setting is enabled,
    // register event listeners to graph
    if (this.event) this.registerEvents();

    const rect = this.canvas.getClientRects().item(0);
    this.dx = rect ? rect.x : 0;
    this.dy = rect ? rect.y : 0;

    initializeContext(this.ctx, this.gmo, this.gto, this.gdo);
    initializeContext(this.stCtx, this.gmo, this.gto, this.gdo);
    initializeContext(this.evCtx, this.gmo, this.gto, this.gdo);
  }

  initializeCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
  ) {
    // nice fix for canvas blur issue
    // from https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
    canvas.width = w * SCALE_FACTOR;
    canvas.height = h * SCALE_FACTOR;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
    ctx.translate(BLUR_OFFSET, BLUR_OFFSET);
  }

  registerEvents() {
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("click", this.onClick.bind(this));
  }

  // to check whether the nodes is valid and safe to render
  // if there are broken dependencies, unexpected node types
  // the checker will output hint information
  safeCheck(elements: ShadowElement[]): string | undefined {
    if (!elements) return;
    for (const el of elements) {
      // TODO: check node
      if (el.children) this.safeCheck(el.children);
    }
    return;
  }

  // render given subtree
  depict9(ctx: CanvasRenderingContext2D, elements?: ShadowElement[]) {
    if (!elements) return;
    for (const el of elements) {
      if (el.hidden || el.destory) continue;
      const r = el.renderer || this.dr;
      ctx.translate(el.x, el.y);
      el.shapes?.forEach((m: Mesh) => r.draw(ctx, m));
      el.texts?.forEach((t: Text) => r.write(ctx, t));
      if (el.preRenderCallback) this.postRender(ctx, el.preRenderCallback);
      if (el.children) this.depict9(ctx, el.children);
      ctx.translate(-el.x, -el.y);
    }
  }

  // render for static nodes
  depict2(elements?: ShadowElement[]) {
    if (!elements) return;
    for (const el of elements) {
      if (el.hidden || el.destory) continue;
      if (el.type !== NodeType.STATIC && el.type !== NodeType.HYBRID) continue;
      const r = el.renderer || this.dr;
      this.stCtx.translate(el.x, el.y);
      el.shapes?.forEach((m: Mesh) => r.draw(this.stCtx, m));
      el.texts?.forEach((t: Text) => r.write(this.stCtx, t));
      if (el.preRenderCallback) this.postRender(this.stCtx, el.preRenderCallback);
      if (el.type === NodeType.STATIC) this.depict9(this.stCtx, el.children);
      if (el.type === NodeType.HYBRID) this.depict2(el.children);
      this.stCtx.translate(-el.x, -el.y);
    }
  }


  // render for event driven nodes
  depict1(force: boolean, elements?: ShadowElement[]) {
    if (!elements) return;
    let deleteTag = false;
    for (let el of elements) {
      if (el.destory) {
        deleteTag = true;
        continue;
      }
      if (el.hidden || (!force && (el.type === NodeType.STATIC || el.type === NodeType.DYNAMIC))) continue;
      this.evCtx.translate(el.x, el.y);
      if (force || el.type === NodeType.EVENT || (!this.animation && !el.type)) {
        // if (el.texts && force) console.log("----------- render text: ", el.texts)
        const r = el.renderer || this.dr;
        el.shapes?.forEach((m: Mesh) => r.draw(this.evCtx, m));
        el.texts?.forEach((t: Text) => r.write(this.evCtx, t));
        if (el.preRenderCallback) this.postRender(this.evCtx, el.preRenderCallback);
        this.depict1(true, el.children);
      }
      if (!force && el.type === NodeType.HYBRID) this.depict1(false, el.children);
      this.evCtx.translate(-el.x, -el.y);
    }
    if (deleteTag) {
      for (let i = elements.length - 1; i >= 0; i--) {
        if (elements[i].destory) elements.splice(i, 1);
      }
    }
  }

  // render for dynamic nodes
  depict0(delta: number, force: boolean, elements?: ShadowElement[]) {
    if (!elements) return;
    let deleteTag = false;
    for (let el of elements) {
      if (el.destory) {
        deleteTag = true;
        continue;
      }
      if (el.hidden || (!force && (el.type === NodeType.EVENT || el.type === NodeType.STATIC))) continue;
      this.ctx.translate(el.x, el.y);
      if (force || !el.type || el.type === NodeType.DYNAMIC) {
        if (el.animate) el.animate(el, delta);
        const r = el.renderer || this.dr;
        el.shapes?.forEach((m: Mesh) => r.draw(this.ctx, m));
        el.texts?.forEach((t: Text) => r.write(this.ctx, t));
        if (el.preRenderCallback) this.postRender(this.ctx, el.preRenderCallback);
        this.depict0(delta, true, el.children);
      }
      if (!force && el.type === NodeType.HYBRID) this.depict0(delta, false, el.children);
      this.ctx.translate(-el.x, -el.y);
    }
    if (deleteTag) {
      for (let i = elements.length - 1; i >= 0; i--) {
        if (elements[i].destory) elements.splice(i, 1);
      }
    }
  }

  private postRender(ctx: CanvasRenderingContext2D, callback: (ctx: CanvasRenderingContext2D) => void) {
    ctx.save();
    callback(ctx);
    ctx.restore();
  }

  // animate the node trees
  animate(delta: number) {
    this.ctx.clearRect(this.x0, this.y0, this.x1, this.y1);
    if (this.event) {
      if (this.evWaiting) {
        this.renderEvent();
        this.evWaiting = false;
      }
      this.ctx.drawImage(this.evCanvas, BLUR_OFFSET, BLUR_OFFSET);
    } else {
      this.ctx.drawImage(this.stCanvas, BLUR_OFFSET, BLUR_OFFSET);
    }
    this.depict0(delta, false, this.elements);
    // enter the next render process
    requestAnimationFrame(this.animate.bind(this));
  }

  start(elements: ShadowElement[]) {
    this.elements = elements;
    if (!this.animation && !this.event) {
      this.depict9(this.ctx, this.elements);
      return;
    }
    // static render
    this.renderStatic();
    if (this.event) {
      this.renderEvent();
    }
    if (this.animation) this.animate(0);
  }

  // trigger specific event
  // current event types could be:
  // [click, mouseenter, mousemove, mouseleave, mouseup, mousedown]
  triggerEvents(ev: string, x: number, y: number, elements?: ShadowElement[]): boolean {
    if (!elements) return true;
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.destory || el.hidden) continue;
      x += el.x;
      y += el.y;
      const hit = this.triggerEvents(ev, x, y, el.children);
      if (!hit) return false;
      // there are 2 different types of event in the system,
      // the global one and the element specific one,
      // the element specific event will run the contain function which
      // is input by the user.
      // the global event will always trigger all the listeners without checking anything
      switch (ev) {
        case "click":
          if (el.onClick && el.contain && el.contain(this.x - x, this.y - y)) {
            this.evWaiting ||= el.onClick(el, x, y, this.x, this.y);
            return false;
          }
          break;
        case "mousemove":
          if (el.onMousemove) {
            if (el.onMousemove(el, x, y, this.x, this.y)) this.evWaiting = true;
          }
          if (el.contain && (el.onMouseenter || el.onMouseleave)) {
            if (el.contain(this.x - x, this.y - y)) {
              if (!this.focus.has(el)) {
                this.focus.add(el);
                if (el.onMouseenter) {
                  this.evWaiting ||= el.onMouseenter(el, x, y, this.x, this.y);
                }
              }
            } else {
              if (this.focus.has(el)) {
                this.focus.delete(el);
                if (el.onMouseleave) {
                  this.evWaiting ||= el.onMouseleave(el, x, y, this.x, this.y);
                }
              }
            }
          }
          break;
        case "mouseup":
          if (el.onMouseup) {
            this.evWaiting ||= el.onMouseup(el, x, y, this.x, this.y);
          }
          break;
        case "mousedown":
          if (
            el.contain &&
            el.contain(this.x - x, this.y - y) &&
            el.onMousedown
          ) {
            this.evWaiting ||= el.onMousedown(el, x, y, this.x, this.y);
            return false;
          }
          break;
        default:
          break;
      }
      x -= el.x;
      y -= el.y;
    }
    return true;
  }

  handleMouseEvent(e: MouseEvent, ev: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.event) return;
    this.x = e.clientX - this.dx;
    this.y = e.clientY - this.dy;
    this.triggerEvents(ev, 0, 0, this.elements);
    // if the animation mode is disabled,
    // render the event frame immediately
    if (this.evWaiting && !this.animation) {
      this.renderEvent();
      this.evWaiting = false;
    }
  }

  renderStatic() {
    this.stCtx.clearRect(this.x0, this.y0, this.x1, this.y1);
    this.depict2(this.elements);
  }

  renderEvent() {
    this.evCtx.clearRect(this.x0, this.y0, this.x1, this.y1);
    this.evCtx.drawImage(this.stCanvas, BLUR_OFFSET, BLUR_OFFSET);
    this.depict1(false, this.elements);
  }

  // handle event: click
  onClick(e: MouseEvent) {
    this.handleMouseEvent(e, "click");
  }

  // handle event: mousemove
  onMouseMove(e: MouseEvent) {
    this.handleMouseEvent(e, "mousemove");
  }

  // handle event: mouseup
  onMouseUp(e: MouseEvent) {
    this.handleMouseEvent(e, "mouseup");
  }

  // handle event: mousedown
  onMouseDown(e: MouseEvent) {
    this.handleMouseEvent(e, "mousedown");
  }
}
