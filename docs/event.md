# Handle Event

example: Listen to Click

```js
// import a rectangle from a canvas/svg path library directly...
import { rectangle } from "impressionist";

// ShadowElement
const w = 200;
const h = 100;

// our shape: a rectangle
const rect = {
    path: rectangle.basicAligned(0, 0, w, h),
    opts: {
        fill: "#888",
    },
};

// click the rectangle to change its color to black.
const se = {
    x: 10,
    y: 5,
    shapes: [rect],
    // First you need to define the contain function.
    // you can use the canvas internal in path API,
    // but AABB bounding box is always faster. it's just 4 number comparasion.
    contain(x, y) {
        return x >= 0 && x <= w && y >= 0 && y <= h;
    },
    // handle click event
    onClick(render, x, y, mx, my) {
        rect.opts.fill = "#000";
        // ask for re-render
        render();
    }
};
```
