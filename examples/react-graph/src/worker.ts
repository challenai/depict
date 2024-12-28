import { Graph, MessageType } from "@pattaya/depict/graph";
import { fooGraph } from "./layers/foo";
import { barGraph } from "./layers/bar";
import { textGraph } from "./layers/text";

const graph = new Graph();

onmessage = (ev) => {
  graph.handleMessageEvent(ev);
  if (ev.data.type === MessageType.INIT) {
    graph.updateQueue(0, textGraph);
    graph.updateLayerOptions(1, { dynamic: false, update: false });
    graph.updateQueue(1, fooGraph);
    graph.updateQueue(2, barGraph);
    graph.updateLayerOptions(2, { dynamic: true });
  }
};