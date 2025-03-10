# Depict

Depict is a JavaScript library for building canvas based user interface.

- Declarative: Depict makes it painless to create complex animation and events driven graph without mind burden.
- Maintainable: Organize simple and clear nodes to Create complex shapes, there are no specific positioning or layout engines included, the only thing you need to care about is its offset, nothing specific to learn. You don't need to consider the relationship among different components, nodes or shapes, and try to manage complex application state communication.
- Performance: Performance auto tuning battery is included. However, if you try to build something really fast, many optional performance tools are available. Demonstrate your app fastly and improve it later if it's necessary. But it's fast enough in most of the cases 
- Multi-pattern: You can build your graph driven by function varibles, or simple state, or even react state, vue state, the graph will be driven by what you expect, no annoying communication between shapes, elements...

## Installation

`npm install @pattaya/depict --save`

## Examples

### examples

You can create graph application with any other framework you like,    
there are some demo applications which include **React**, **Vue**, **Svelte**, or **vanilla javascript** based graph,  
listed as follows:  

- [React graph example](https://github.com/challenai/depict/blob/main/examples/react-graph/README.md)
- [Vue graph example](https://github.com/challenai/depict/blob/main/examples/vue-graph/README.md)
- [Svelte graph example](https://github.com/challenai/depict/blob/main/examples/svelte-graph/README.md)
- [HTML + Javascript example](https://github.com/challenai/depict/blob/main/examples/vanilla/README.md)
- [Web Worker example](https://github.com/challenai/depict/blob/main/examples/vanilla-worker/README.md)

for **every application** in the `examples` directory, you can run the application with the following steps.  

```shell
cd exmaples/xxx

# install packages
npm install

# run the application
npm run dev
```

## Quick Guide 

```ts
import { NonWorkerDepict } from "@pattaya/depict/nonworker";

// First, you should create a depict instance to hold the graph canvas DOM.
const depict = new NonWorkerDepict({
  root: root_div_element, // root_div_element = <div></div>
  maxLayers: 1,
  graph: graph,
});

// start your graph
depict.start();

// Now, you can build your image with an array of nodes.  
// You can add events, animation or even state system if you want to build something big.
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

// update the first layer with our shapes
depict.graph.updateQueue(0, [node]);
// request render the new elements
depict.graph.renderAll();
```

### features

works in the todo list:   
- [x] support single thread version.
- [x] provide api to get text rect information.
- [x] support text align.
- [ ] support change element render priority.
- [x] support text bounding box
- [ ] provide a new animated renderer ?
- [ ] more examples: render image, animation

### License

MIT
