import { Depict } from "@pattaya/depict";
import { useEffect, useRef, useState } from "react";
import { MsgUpdateReactState } from "./msg";

const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: "module"
});

export interface GraphContainerProps {
  count: number;
};

function GraphContainer({ count }: GraphContainerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<Depict | undefined>(undefined);

  useEffect(() => {
    let g = graph;
    if (!g) {
      const canvas = rootRef.current;
      if (canvas === null) return;
      g = new Depict({
        root: canvas,
        maxLayers: 3,
        worker,
      });
      setGraph(g);
      g.start();
    }

    return () => g?.destroy();
  }, []);

  useEffect(() => {
    worker.postMessage({ type: MsgUpdateReactState, msg: count });
  }, [count]);

  return (
    <div
      style={{
        position: "relative",
        width: "600px",
        height: "400px",
        border: "1px solid #333",
        borderRadius: "20px",
        // overflow: "hidden"
      }}
      ref={rootRef}
    ></div>
  )
}

export default GraphContainer;