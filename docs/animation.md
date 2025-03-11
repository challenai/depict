# Animation

You can ask the graph to re-render each frame by setting the graph `dynamic`.  

```js
const g = new Graph();
g.updateLayerOptions(0, { dynamic: true });
```

Update the node right before render.

```js
// import a rectangle from a canvas/svg path library directly...
import { rectangle } from "impressionist";

const n = {
    x: 0,
    y: 0,
    shapes: [{
        path: rectangle.basicAligned(0, 0, w, h),
        opts: {
            fill: "#888",
        },
    }],
    update(timestamp) {
        this.x = Math.sin(timestamp) * 100;
    }
};

g.resetQueue(0, [n]);
g.renderAll();
```

## example

[rotating logo in the graph](https://github.com/challenai/depict/blob/main/examples/vanilla/graph/bar.js).