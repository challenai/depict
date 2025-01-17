import { ShadowElement } from "@pattaya/depict/graph";
import { Rectangle } from "@pattaya/pather";
import { reactState } from "./state";

export const fooGraph: ShadowElement[] = [
  {
    x: 64,
    y: 36,
    texts: [
      {
        x: -28,
        y: 4,
        content: "",
        opts: {
          fill: "#888",
          font: "16px san-serf",
        }
      }
    ],
    update() {
      this.texts![0].content = `react count: ${reactState.count}, speed level: ${reactState.count % 10}`;
    },
  },
  {
    x: 198,
    y: 181,
    shapes: [
      {
        path: Rectangle.Basic(0, 0, 96, 72),
        opts: {
          stroke: "#666",
          fill: "#333",
        }
      },
    ],
    contain(x, y) {
      return x > -48 && x < 48 && y > -36 && y < 36;
    },
    onMouseenter(render) {
      this.shapes![0].opts!.fill = "#222";
      render();
    },
    onMouseleave(render) {
      this.shapes![0].opts!.fill = "#333";
      render();
    },
  },
];