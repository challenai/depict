<script lang="ts">
  import Counter from "./lib/Counter.svelte";
  import Graph from "./lib/Graph.svelte";
</script>

<main>
  <Graph />
  <h1>Vite + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Edit
    <code>lib/Graph.vue</code> to start
  </p>

  <p class="read-the-docs">
    this is an example application to run depict in Vue.
  </p>
</main>

<style>
  .read-the-docs {
    color: #888;
  }
</style>
