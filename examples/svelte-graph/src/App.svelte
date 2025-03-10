<script lang="ts">
  import Graph from "./GraphContainer.svelte";

  let count: number = $state(0);
  const increment = () => {
    count += 1;
  };
</script>

<main>
  <Graph {count} />
  <h1>Depict + Svelte</h1>

  <div class="card">
    <button onclick={increment}>
      count is {count}
    </button>
  </div>

  <p>
    Edit
    <code>lib/Graph.svelte</code> to start
  </p>

  <p class="read-the-docs">
    this is an example application to run depict in Svelte.
  </p>
</main>

<style>
  .read-the-docs {
    color: #888;
  }
</style>
