import { Graph } from "@challenai/depict/graph";
import { textGraph } from "./text";
import { fooGraph } from "./foo";
import { barGraph } from "./bar";

const p = new Graph();

console.log(p)
export { counterState } from "./state";
export const graph = new Graph();

graph.onReady(() => {
  // first layer: text
  graph.updateQueue(0, textGraph);
  // second layer: foo
  graph.updateQueue(1, fooGraph);
  graph.updateLayerOptions(1, { dynamic: false, update: true });
  // third layer: bar
  graph.updateQueue(2, barGraph);
  graph.updateLayerOptions(2, { dynamic: true });
});
