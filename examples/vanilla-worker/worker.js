import { Graph, MessageType } from "@challenai/depict/graph";
import { fooGraph } from "./layers/foo";
import { barGraph } from "./layers/bar";
import { textGraph } from "./layers/text";
import { counterState } from "./layers/state";
import { MsgUpdateCounterState } from "./msg";

// run background graph
const graph = new Graph();

// handle worker message
onmessage = (ev) => {
  graph.handleMessageEvent(ev);
  if (ev.data.type === MessageType.INIT) {
    graph.updateQueue(0, textGraph);
    graph.updateQueue(1, fooGraph);
    graph.updateLayerOptions(1, { dynamic: false, update: true });
    graph.updateQueue(2, barGraph);
    graph.updateLayerOptions(2, { dynamic: true });
  } else if (ev.data.type === MsgUpdateCounterState) {
    // set react state to graph, it's just a simple copy.
    // if you don't like state style, you can directly change the elements.
    // declarative style or command style are supported at the same time.
    counterState.count = ev.data.msg;
    // ask to redraw only the second layer.
    graph.render(1);
  }
};