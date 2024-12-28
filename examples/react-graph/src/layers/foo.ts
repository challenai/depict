import { ShadowElement } from "@pattaya/depict/graph";

const rectangle = (x: number, y: number, width: number, height: number): string => {
  return `
    M${x} ${y}
    l${width} 0
    l0 ${height}
    l${-width} 0
    Z
  `;
};

export const fooGraph: ShadowElement[] = [
  {
    x: 150,
    y: 145,
    shapes: [
      {
        path: rectangle(0, 0, 96, 72),
        opts: {
          stroke: "#666",
          fill: "#333",
        }
      }
    ],
    contain(x, y) {
      return x > 0 && x < 96 && y > 0 && y < 72;
    },
    onMouseenter(self, render) {
      self.shapes![0].opts!.fill = "#222";
      render();
      return false;
    },
    onMouseleave(self, render) {
      self.shapes![0].opts!.fill = "#333";
      render();
      return false;
    },
  },
];