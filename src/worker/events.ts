import type { ShadowElement } from "./element";

// default event handler
export class BinaryEventHandler {
  // TODO: 1. if we should pass event type ?
  // TODO: 2. improve sort logic, maybe insert sort, is it possible to insert in a batch?
  // TODO: 3. unrefered nodes gabarge collection
  nodes: ShadowElement[];

  constructor() {
    this.nodes = [];
  }

  trigger(x: number, y: number): ShadowElement | null {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const current = this.nodes[i];
      // TODO: gc here
      if (current.contain && current.contain(x - current._state.dx - current.x, y - current._state.dy - current.y)) {
        return current;
      }
    }
    return null;
  }

  triggerAll(x: number, y: number): ShadowElement[] {
    const active = [];
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const current = this.nodes[i];
      if (current.contain && current.contain(x - current._state.dx - current.x, y - current._state.dy - current.y)) {
        active.push(current);
      }
    }
    return active;
  }

  get elements() {
    return this.nodes;
  }

  add(el: ShadowElement) {
    this.nodes.push(el);
    // bubble to right position
    for (let i = this.nodes.length - 1; i > 0; i--) {
      if (this.nodes[i]._state.idx > this.nodes[i - 1]._state.idx) return;
      this.nodes[i], this.nodes[i - 1] = this.nodes[i - 1], this.nodes[i];
    }
  }
}
