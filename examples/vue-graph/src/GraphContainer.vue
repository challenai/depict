<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { NonWorkerDepict } from "@challenai/depict/nonworker";
import { graph, graphState } from "./graph";

export default defineComponent({
  name: "Graph",
  props: {
    count: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const rootRef = ref<HTMLDivElement>()
    const depict = ref<NonWorkerDepict | undefined>(undefined)

    onMounted(() => {
      if (!depict.value) {
        if (!rootRef.value) return
        depict.value = new NonWorkerDepict({
          root: rootRef.value,
          maxLayers: 3,
          graph: graph,
        });
        depict.value.start();
      }
    })

    watch(() => props.count, (nv, _ov) => {
      graphState.count = nv;
      graph.renderAll();
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
