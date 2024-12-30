<script lang="ts">
import { Depict } from '@pattaya/depict';
import { defineComponent, onMounted, ref, watch } from 'vue';
import { MsgUpdateVueState } from './msg';

const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: "module"
});

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
    const graph = ref<Depict | undefined>(undefined)

    onMounted(() => {
      if (!graph.value) {
        if (!rootRef.value) return
        graph.value = new Depict({
          root: rootRef.value,
          maxLayers: 3,
          worker,
        });
        graph.value.start();
      }
    })

    watch(() => props.count, (nv, _ov) => {
      worker.postMessage({ type: MsgUpdateVueState, msg: nv });
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
  position: relative;
  width: 600px;
  height: 400px;
  border: 1px solid #333;
  border-radius: 20px;
}
</style>
