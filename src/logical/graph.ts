import type { Renderer } from "@physical/render";
import type { ShadowElement } from "./element";
import type { Mesh, Text } from "@physical/drawable";

// the internal graph
export class Graph {
  // default renderer when not specified
  dr: Renderer;

  constructor(defaultRenderer: Renderer) {
    this.dr = defaultRenderer;
  }

  // navie method to draw nodes
  depict(elements: ShadowElement[]) {
    if (!elements) return;
    elements.forEach((el: ShadowElement) => {
      const r = el.renderer || this.dr;
      r.offset(el.x, el.y);
      el.shapes?.forEach((m: Mesh) => r.draw(m));
      el.texts?.forEach((t: Text) => r.write(t));
      if (el.children) this.depict(el.children);
      r.offset(-el.x, -el.y);
    });
  }

  // handle event: click
  onClick() { }

  // handle event: mousemove
  onMouseMove() { }

  // handle event: mouseup
  onMouseUp() { }

  // handle event: mousedown
  onMouseDown() { }
}