# HTML + Javascript

HTML: 

```html
<div id="graph" style="width: 600px; height: 400px; position: relative;"></div>
```

javascript:

```js
// First, you should create a depict instance to hold the graph canvas DOM.
const d = new NonWorkerDepict({
    root: document.getElementById('#graph'),
    maxLayers: 3,
    graph: new Graph(),
});
// start the graph
d.start();

// Now, you can build your image with an array of nodes.  
// You can add events, animation or even state system if you want to build something big.
d.graph.resetGraph([[{
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
}]]);
```