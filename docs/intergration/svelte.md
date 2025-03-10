# Svelte


```svelte
<script lang="ts">
  import { NonWorkerDepict } from "@pattaya/depict/nonworker";
  import { Graph } from "@pattaya/depict/graph";
  import { onMount } from "svelte";

  let depict: NonWorkerDepict | undefined = $state(undefined);
  let rootRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!depict) {
      if (!rootRef) return;
      // First, you should create a depict instance to hold the graph canvas DOM.
      depict = new NonWorkerDepict({
        root: rootRef,
        maxLayers: 1,
        graph: new Graph(),
      });

      // start your graph
      depict.start();

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

    return () => depict?.destroy();
  });
</script>

<div class="graph" bind:this={rootRef}></div>

<style>
  .graph {
    /* take care: the graph container should have width, height and relative position */
    /* or it take up 100% of its parent, (so that it's not 0px) */
    position: relative;
    width: 600px;
    height: 400px;
    border: 1px solid #333;
    border-radius: 20px;
  }
</style>
```