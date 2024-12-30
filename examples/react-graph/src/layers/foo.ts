import { ShadowElement } from "@pattaya/depict/graph";
import { Rectangle } from "@pattaya/pather";

export const fooGraph: ShadowElement[] = [
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
      return false;
    },
    onMouseleave(render) {
      this.shapes![0].opts!.fill = "#333";
      render();
      return false;
    },
  },
];