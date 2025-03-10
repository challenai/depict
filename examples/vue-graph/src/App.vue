<script setup lang="ts">
import GraphContainer from './GraphContainer.vue'
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <GraphContainer :count="count" />
  <h1>Vue + Depict</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/Graph.vue</code> to test HMR
    </p>
  </div>

  <p class="read-the-docs">this is an example application to run depict in Vue.</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
