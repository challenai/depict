import { useEffect, useRef, useState } from "react";
import { NonWorkerDepict } from "@challenai/depict/nonworker";
import { graph, graphState } from "./graph";

export interface GraphContainerProps {
  count: number;
};

function GraphContainer({ count }: GraphContainerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [depict, setDepict] = useState<NonWorkerDepict | undefined>(undefined);

  useEffect(() => {
    let d = depict;
    if (!d) {
      const canvas = rootRef.current;
      if (canvas === null) return;
      d = new NonWorkerDepict({
        root: canvas,
        maxLayers: 3,
        graph: graph,
      });
      setDepict(d);
      d.start();
    }

    return () => d?.destroy();
  }, []);

  useEffect(() => {
    // deliever your react state to graph, it's quite simple, just set graphState.xx = reactState
    graphState.count = count;
    // ask the graph to render your new state
    depict?.graph.renderAll();
  }, [count]);

  return (
    <div
      style={{
        // take care: the graph container should have width, height and relative position
        // or it take up 100% of its parent, (so that it's not 0px)
        position: "relative",
        width: "600px",
        height: "400px",
        border: "1px solid #333",
        borderRadius: "20px",
      }}
      ref={rootRef}
    ></div>
  )
}

export default GraphContainer;