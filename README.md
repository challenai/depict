# Depict

**Depict** is a JavaScript library for building canvas-based user interfaces.

- **Declarative:** Depict makes it painless to create complex, animation and event-driven graphs without mental overhead.
- **Maintainable:** Organize simple and clear nodes to create complex shapes. There's no need for specific positioning or layout engines—just focus on offsets. No need to manage complex relationships or application state communication.
- **Performance:** Includes automatic performance tuning, but if you need even better performance, optional tools are available. You can quickly demonstrate your app and optimize later. It's fast enough for most cases.
- **Multi-pattern:** You can build your graph driven by function variables, simple state, or even React, Vue, or Svelte state. The graph will be driven as expected, with no need for complex communication between shapes and elements.

---

## Installation

```bash
npm install @pattaya/depict --save
```

## Examples
You can create a graph application with any framework you prefer. The following demo applications are available, which include examples using **React**, **Vue**, **Svelte**, or **vanilla javascript**:

- [React graph example](https://github.com/challenai/depict/blob/main/examples/react-graph/README.md)
- [Vue graph example](https://github.com/challenai/depict/blob/main/examples/vue-graph/README.md)
- [Svelte graph example](https://github.com/challenai/depict/blob/main/examples/svelte-graph/README.md)
- [HTML + Javascript example](https://github.com/challenai/depict/blob/main/examples/vanilla/README.md)
- [Web Worker example](https://github.com/challenai/depict/blob/main/examples/vanilla-worker/README.md)

To run any application from the `examples` directory, follow these steps:

```bash
cd exmaples/xxx

# install packages
npm install

# run the application
npm run dev
```

## Quick Guide 

```ts
import { NonWorkerDepict } from "@pattaya/depict/nonworker";

// Create a depict instance to hold the graph canvas DOM
const depict = new NonWorkerDepict({
  root: root_div_element, // root_div_element = <div></div>
  maxLayers: 1,
  graph: graph,
});

// Start your graph
depict.start();

// Now, you can build your graph with an array of nodes. 
// You can add events, animations, or even a state system for larger applications.
const node = {
  x: 150,
  y: 145,
  shapes: [
    {
      path: "M 20 20 l 0 100",
      opts: {
        stroke: "#666",
        fill: "#333",
      }
    }
  ],
};

// Update the first layer with our shapes
depict.graph.updateQueue(0, [node]);
// Request to render the new elements
depict.graph.renderAll();
```

### Features

To-do list:

- [x] Support single-thread version.
- [x] Provide API to get text rectangle information.
- [x] Support text alignment.
- [x] Support changing element render priority.
- [x] Support text bounding box.
- [x] Provide a new animated renderer?
- [x] More examples: rendering images, animations.

### License

MIT
