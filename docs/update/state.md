# State Driven

Depict provides an `update` hook that allows you to control your graphs using states.  
You define the different states related to your **ShadowElements**, and then use custom `update` functions to control the graph's behavior based on those states.

You can store your state in a **plain JavaScript object**,  
and refer to this state inside your `update` function to manage the graph's dynamic behavior.


## Example: Control the rectangle width by interval

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
