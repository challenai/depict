## Installation

`npm install @pattaya/depict --save`

## First Graph

Create a depict instance first.  
There are two options: web worker version and a common version.  
If you want to offload the graph to another thread, you can pick the web worker version to improve performance.  

```js
const depict = new NonWorkerDepict({
    root: document.getElementById('#graph'),
    maxLayers: 3,
    graph: new Graph(),
});
```

Then, start the graph, if your application need to do some preparation(for example: load some data),  
you can start it later.

```js
depict.start();
```

Last, you build some shapes and render.
You can request for re-rendering when you change the graph.

```js
const node = {
  x: 240,
  y: 130,
  shapes: [
  {
      path: "M 20 20 l 0 100",
      opts: {
      stroke: "#666",
      fill: "#333",
      },
  },
  ]
};

depict.graph.resetGraph([[n]]);
depict.graph.renderAll();
```

## Popular Frameworks

[to integrate React](/#/intergration/react)

[to integrate Vue](/#/intergration/vue)

[to integrate Svelte](/#/intergration/svelte)

[to use in pure HTML](/#/intergration/vanilla)