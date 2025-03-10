<script lang="ts">
  import { NonWorkerDepict } from "@pattaya/depict/nonworker";
  import { onMount } from "svelte";
  import { graph, graphState } from "./graph";

  let { count } = $props();

  $effect(() => {
    graphState.count = count;
    graph.renderAll();
  });

  let depict: NonWorkerDepict | undefined = $state(undefined);
  let rootRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!depict) {
      if (!rootRef) return;
      depict = new NonWorkerDepict({
        root: rootRef,
        maxLayers: 3,
        graph: graph,
      });
      depict.start();
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
