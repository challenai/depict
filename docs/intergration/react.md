# React

```ts
import { NonWorkerDepict } from "@pattaya/depict/nonworker";
import { Graph } from "@pattaya/depict/graph";
import { useEffect, useRef, useState } from "react";

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<NonWorkerDepict | undefined>(undefined);

  useEffect(() => {
    let g = graph;
    if (!g) {
      const canvas = rootRef.current;
      if (canvas === null) return;
      // First, you should create a depict instance to hold the graph canvas DOM.
      g = new NonWorkerDepict({
        root: canvas,
        maxLayers: 1,
        graph: new Graph(),
      });

      setGraph(g);
      // start your graph
      g.start();
      
      // Now, you can build your image with an array of nodes.  
      // You can add events, animation or even state system if you want to build something big.
      g.graph.resetGraph([[{
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
    }
    // remember to destory the graph
    return () => g?.destroy();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "600px",
        height: "400px",
      }}
      ref={rootRef}
    ></div>
  );
}
```