import type { ShadowElement } from "./element";

// default event handler
export class BinaryEventHandler {
  nodes: ShadowElement[];

  constructor() {
    this.nodes = [];
  }

  trigger(x: number, y: number): ShadowElement | null {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const current = this.nodes[i];
      if (current.hidden) continue;
      if (current._state?.destory) {
        this.nodes.splice(i, 1);
        continue;
      }
      if (current.contain && current.contain(x - current._state!.dx - current.x, y - current._state!.dy - current.y)) {
        return current;
      }
    }
    return null;
  }

  triggerAll(x: number, y: number): ShadowElement[] {
    const active = [];
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const current = this.nodes[i];
      if (current.hidden) continue;
      if (current._state?.destory) {
        this.nodes.splice(i, 1);
        continue;
      }
      if (current.contain && current.contain(x - current._state!.dx - current.x, y - current._state!.dy - current.y)) {
        active.push(current);
      }
    }
    return active;
  }

  get elements() {
    return this.nodes;
  }

  add(el: ShadowElement) {
    // Find the correct insertion point using binary search
    let left = 0;
    let right = this.nodes.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (this.nodes[mid]._state!.idx < el._state!.idx) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // Insert the element at the found position
    this.nodes.splice(left, 0, el);
  }
}
