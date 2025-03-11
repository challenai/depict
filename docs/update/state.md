# State Driven

store your state in a `plain Javascript object`,  
refer this state in your graph.  

```js
import { rectangle } from "impressionist";

const graphState = { width: 200 };

// the state can be controlled by React, Vue, HTTP request or something else.
// use setInterval to mock.
setInterval(() => graphState.width++, 200);

const rect = {
    path: rectangle.basicAligned(0, 0, 0, h),
    opts: {
        fill: "#888",
    },
};

const node = {
    x: 0,
    y: 0,
    shapes: [rect],
    update() {
        // the width of rectangle will be controlled by the state.
        rect.path = rectangle.basicAligned(0, 0, graphState.width, h),
        // you can change this.x or anything else too.
    }
};

```

## example

You can find examples to integrate with React, Vue, Svelte state.
[control graph by state](https://github.com/challenai/depict/blob/main/examples/vanilla/graph/foo.js).
