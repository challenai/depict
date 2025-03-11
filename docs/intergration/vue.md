# Vue

```vue
<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { NonWorkerDepict } from "@pattaya/depict/nonworker";
import { Graph } from "@pattaya/depict/graph";
export const graph = new Graph();

export default defineComponent({
  name: "Graph",
  setup(props) {
    const rootRef = ref<HTMLDivElement>()
    const depict = ref<NonWorkerDepict | undefined>(undefined)

    onMounted(() => {
      if (!depict.value) {
        if (!rootRef.value) return
        // First, you should create a depict instance to hold the graph canvas DOM.
        depict.value = new NonWorkerDepict({
          root: rootRef.value,
          maxLayers: 3,
          graph,
        });
        // start the graph
        depict.value.start();

        // Now, you can build your image with an array of nodes.  
        // You can add events, animation or even state system if you want to build something big.
        graph.resetGraph([[{
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
    })

    return {
      rootRef,
    }
  }
})

</script>

<template>
  <div class="graph" ref="rootRef"></div>
</template>

<style scoped>
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