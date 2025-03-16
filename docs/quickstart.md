## 🚀 Installation

`npm install @challenai/depict --save`

## 🎨 First Graph

To create a Depict instance, choose between two options:

- Web Worker Version – Offloads the graph processing to another thread for improved performance.
- Common Version – Runs in the main thread.

Initialize Depict
```js
const depict = new NonWorkerDepict({
    root: document.getElementById('#graph'),
    maxLayers: 3,
    graph: new Graph(),
});
```

Start the Graph
```js
depict.start();
```

Create and Render Shapes
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

## 🔗 Popular Frameworks

[to integrate React](/intergration/react)

[to integrate Vue](/intergration/vue)

[to integrate Svelte](/intergration/svelte)

[to use in pure HTML](/intergration/vanilla)