import { Depict } from "@challenai/depict";
import { MsgUpdateCounterState } from "./msg";

// run worker
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: "module"
});

// our data in javascript: counter
let counter = 0;

// display the graph
export function setupGraph(element) {
  if (!element) return;
  const g = new Depict({
    root: element,
    maxLayers: 3,
    worker,
  });
  g.start();
}

// click button to add counter
export function setupCounter(element) {
  const setCounter = (count) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
    worker.postMessage({ type: MsgUpdateCounterState, msg: count });
  };
  element.addEventListener('click', () => setCounter(counter + 1));
  setCounter(0);
}