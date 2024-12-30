<script lang="ts">
  import { Depict } from "@pattaya/depict";
  import { onMount } from "svelte";
  import { MsgUpdateSvelteState } from "./msg";

  const worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });

  let { count } = $props();

  $effect(() => {
    worker.postMessage({ type: MsgUpdateSvelteState, msg: count });
  });

  let graph: Depict | undefined = $state(undefined);
  let rootRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!graph) {
      if (!rootRef) return;
      graph = new Depict({
        root: rootRef,
        maxLayers: 3,
        worker,
      });
      graph.start();
    }

    return () => graph?.destory();
  });
</script>

<div class="graph" bind:this={rootRef}></div>

<style>
  .graph {
    position: relative;
    width: 600px;
    height: 400px;
    border: 1px solid #333;
    border-radius: 20px;
  }
</style>
