import type { Renderer } from "@physical/render";
import { type ShadowElement, NodeType } from "./element";
import type { Mesh, Text } from "@physical/drawable";

const DEVICE_RATIO = window.devicePixelRatio;

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
  // width
  w: number;
  // height
  h: number;

  constructor({ canvas, defaultRenderer, width, height, event, animation }: GraphOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    this.initializeCanvas(canvas, this.ctx, width, height, true);
    this.stCanvas = canvas;
    this.stCtx = this.ctx;
    this.evCanvas = canvas;
    this.evCtx = this.ctx;
    if (animation || event) {
      this.stCanvas = document.createElement('canvas');
      this.stCtx = this.stCanvas.getContext('2d') as CanvasRenderingContext2D;
      this.initializeCanvas(this.stCanvas, this.stCtx, width, height, false)
    }
    if (event) {
      this.evCanvas = document.createElement('canvas');
      this.evCtx = this.evCanvas.getContext('2d') as CanvasRenderingContext2D;
      this.initializeCanvas(this.evCanvas, this.evCtx, width, height, false)
    }
    this.w = width;
    this.h = height;
    this.dr = defaultRenderer;
    this.elements = [];
    this.animation = animation;
    this.event = event;
    // this.update = true;
  }

  initializeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, w: number, h: number, visible: boolean) {
    // nice fix for canvas blur issue
    // from https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
    canvas.width = w * DEVICE_RATIO;
    canvas.height = h * DEVICE_RATIO;

    ctx.scale(DEVICE_RATIO, DEVICE_RATIO);
    ctx.translate(-.5, -.5);

    if (!visible) canvas.style.display = "none";
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

  animate(delta: number) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    if (this.event) {
      this.ctx.drawImage(this.evCanvas, 0, 0);
    } else {
      this.ctx.drawImage(this.stCanvas, 0, 0);
    }
    this.depict0(this.elements, delta);
    requestAnimationFrame(this.animate.bind(this));
  }

  start(elements: ShadowElement[]) {
    this.elements = elements;
    if (!this.animation && !this.event) {
      this.depict9(this.elements);
      return;
    }
    // static render
    this.stCtx.clearRect(0, 0, this.w, this.h);
    this.depict2(this.elements);
    // TODO: cache
    if (this.event) this.depict1(this.elements);
    if (this.animation) this.animate(0);
  }

  // handle event: click
  onClick(x: number, y: number) { }

  // handle event: mousemove
  onMouseMove(x: number, y: number) { }

  // handle event: mouseup
  onMouseUp(x: number, y: number) { }

  // handle event: mousedown
  onMouseDown(x: number, y: number) { }
}