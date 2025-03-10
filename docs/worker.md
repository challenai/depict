# Web Worker

Depict can be offload to another worker thread if you have a complex graph.  

## Run Graph in Worker thread

First, create your graph.

```js
// a mock node
const mockNode = {
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

// worker.js
const graph = new Graph();

// handle worker message
onmessage = (ev) => {
    graph.handleMessageEvent(ev);
    if (ev.data.type === MessageType.INIT) {
        graph.updateQueue(0, [[mockNode]]);
    } else if (ev.data.type === "....user_defined_event") {
        // handle your message from main thread
        // for example: state change from React, or new data arrived
        graph.render(1);
  }
};
```

Then create a web worker version depict instance, and start it.  
remeber to pass the worker to depict, so that depict can send message to your graph.

```js
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: "module"
});

const depict = new Depict({
    root: div_root, // <div></div>
    maxLayers: 1,
    worker,
});
depict.start();
```

If you want to update the graph in the worker thread, you need to post a message.

```js
worker.postMessage({ type: "...", msg: ... });
```