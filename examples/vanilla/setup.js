import { NonWorkerDepict } from "@pattaya/depict/nonworker";
import { graph, counterState } from "./graph";

let counter = 0;

// display the graph
export function setupGraph(element) {
  if (!element) return;
  const g = new NonWorkerDepict({
    root: element,
    maxLayers: 3,
    graph,
  });
  g.start();
}

// click button to add counter
export function setupCounter(element) {
  const setCounter = (count) => {
    counter = count;
    element.innerHTML = `count is ${count}`;
    counterState.count = count;
    graph.renderAll();
  };
  element.addEventListener('click', () => setCounter(counter + 1));
  setCounter(0);
}