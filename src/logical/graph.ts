import type { Renderer } from "@physical/render";
import { type ShadowElement, NodeType } from "./element";
import type { Mesh, Text } from "@physical/drawable";

// device ratio to adapt different device, prevent blur issue
const SCALE_FACTOR = window.devicePixelRatio;
const BLUR_OFFSET = -0.5;

export interface GraphOptions {
  canvas: HTMLCanvasElement;
  defaultRenderer: Renderer;
  width: number;
  height: number;
  animation: boolean;
  event: boolean;
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
  focus: Set<ShadowElement>;

  constructor({
    canvas,
    defaultRenderer,
    width,
    height,
    event,
    animation,
  }: GraphOptions) {
    this.x0 = BLUR_OFFSET;
    this.y0 = BLUR_OFFSET;
    this.x1 = width + BLUR_OFFSET;
    this.y1 = height + BLUR_OFFSET;
    this.x = 0;
    this.y = 0;

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.initializeCanvas(canvas, this.ctx, width, height, true);
    this.stCanvas = canvas;
    this.stCtx = this.ctx;
    this.evCanvas = canvas;
    this.evCtx = this.ctx;

    if (animation || event) {
      this.stCanvas = document.createElement("canvas");
      this.stCtx = this.stCanvas.getContext("2d") as CanvasRenderingContext2D;
      this.initializeCanvas(this.stCanvas, this.stCtx, width, height, false);
    }

    if (event) {
      this.evCanvas = document.createElement("canvas");
      this.evCtx = this.evCanvas.getContext("2d") as CanvasRenderingContext2D;
      this.initializeCanvas(this.evCanvas, this.evCtx, width, height, false);
    }

    this.dr = defaultRenderer;
    this.elements = [];
    this.animation = animation;
    this.event = event;

    this.focus = new Set();
    this.registerEvents();
  }

  initializeCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    visible: boolean
  ) {
    // nice fix for canvas blur issue
    // from https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
    canvas.width = w * SCALE_FACTOR;
    canvas.height = h * SCALE_FACTOR;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
    ctx.translate(BLUR_OFFSET, BLUR_OFFSET);

    if (!visible) canvas.style.display = "none";
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

  // render for static graph
  depict9(elements: ShadowElement[]) {
    if (!elements) return;
    for (const el of elements) {
      const r = el.renderer || this.dr;
      this.ctx.translate(el.x, el.y);
      el.shapes?.forEach((m: Mesh) => r.draw(this.ctx, m));
      el.texts?.forEach((t: Text) => r.write(this.ctx, t));
      if (el.children) this.depict9(el.children);
      this.ctx.translate(-el.x, -el.y);
    }
  }

  // render for static nodes
  depict2(elements: ShadowElement[]) {
    if (!elements) return;
    for (const el of elements) {
      if (el.type !== NodeType.STATIC) continue;
      const r = el.renderer || this.dr;
      this.stCtx.translate(el.x, el.y);
      el.shapes?.forEach((m: Mesh) => r.draw(this.stCtx, m));
      el.texts?.forEach((t: Text) => r.write(this.stCtx, t));
      if (el.children) this.depict2(el.children);
      this.stCtx.translate(-el.x, -el.y);
    }
  }

  // render for event driven nodes
  depict1(elements: ShadowElement[]) {
    if (!elements) return;
    for (let el of elements) {
      if (el.type !== NodeType.EVENT) continue;
      const r = el.renderer || this.dr;
      this.evCtx.translate(el.x, el.y);
      el.shapes?.forEach((m: Mesh) => r.draw(this.evCtx, m));
      el.texts?.forEach((t: Text) => r.write(this.evCtx, t));
      if (el.children) this.depict1(el.children);
      this.evCtx.translate(-el.x, -el.y);
    }
  }

  // render for dynamic nodes
  depict0(elements: ShadowElement[], delta: number) {
    if (!elements) return;
    for (let el of elements) {
      if (el.type === NodeType.EVENT || el.type === NodeType.STATIC) continue;
      if (el.animate) el.animate(el, delta);
      const r = el.renderer || this.dr;
      this.ctx.translate(el.x, el.y);
      el.shapes?.forEach((m: Mesh) => r.draw(this.ctx, m));
      el.texts?.forEach((t: Text) => r.write(this.ctx, t));
      if (el.children) this.depict0(el.children, delta);
      this.ctx.translate(-el.x, -el.y);
    }
  }

  // animate the node trees
  animate(delta: number) {
    this.ctx.clearRect(this.x0, this.y0, this.x1, this.y1);
    if (this.event) {
      this.ctx.drawImage(this.evCanvas, BLUR_OFFSET, BLUR_OFFSET);
    } else {
      this.ctx.drawImage(this.stCanvas, BLUR_OFFSET, BLUR_OFFSET);
    }
    this.depict0(this.elements, delta);
    // enter the next render process
    requestAnimationFrame(this.animate.bind(this));
  }

  start(elements: ShadowElement[]) {
    this.elements = elements;
    if (!this.animation && !this.event) {
      this.depict9(this.elements);
      return;
    }
    // static render
    this.stCtx.clearRect(this.x0, this.y0, this.x1, this.y1);
    this.depict2(this.elements);
    // TODO: cache
    if (this.event) {
      this.evCtx.clearRect(this.x0, this.y0, this.x1, this.y1);
      this.depict1(this.elements);
    }
    if (this.animation) this.animate(0);
  }

  triggerEvents(elements: ShadowElement[], ev: string, x: number, y: number) {
    if (!elements) return;
    for (let el of elements) {
      x += el.x;
      y += el.y;
      if (el.contain && el.contain(this.x - x, this.y - y)) {
        if (ev === "click") {
          // if (el.onClick) el.onClick();
        } else if (ev == "mousemove") {
          if (!this.focus.has(el)) {
            this.focus.add(el);
            if (el.onMouseenter) el.onMouseenter(el);
          }
        }
      } else {
        if (this.focus.has(el)) {
          this.focus.delete(el);
          if (el.onMouseleave) el.onMouseleave(el);
        }
      }
      if (el.children) this.triggerEvents(el.children, ev, x, y);
      x -= el.x;
      y -= el.y;
    }
  }

  handleMouseEvent(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.x = e.clientX;
    this.y = e.clientY;
  }

  // handle event: click
  onClick(e: MouseEvent) {
    this.handleMouseEvent(e);
  }

  // handle event: mousemove
  onMouseMove(e: MouseEvent) {
    this.handleMouseEvent(e);
    this.triggerEvents(this.elements, "mousemove", 0, 0);
  }

  // handle event: mouseup
  onMouseUp(e: MouseEvent) {
    this.handleMouseEvent(e);
    // TODO
  }

  // handle event: mousedown
  onMouseDown(e: MouseEvent) {
    this.handleMouseEvent(e);
    // TODO
  }
}
