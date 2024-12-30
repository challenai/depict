import { Graph, MessageType } from "@pattaya/depict/graph";
import { fooGraph } from "./layers/foo";
import { barGraph } from "./layers/bar";
import { textGraph } from "./layers/text";
import { svelteState } from "./layers/state";
import { MsgUpdateSvelteState } from "./msg";

const graph = new Graph();

onmessage = (ev) => {
  graph.handleMessageEvent(ev);
  if (ev.data.type === MessageType.INIT) {
    graph.updateQueue(0, textGraph);
    graph.updateQueue(1, fooGraph);
    graph.updateLayerOptions(1, { dynamic: false, update: true });
    graph.updateQueue(2, barGraph);
    graph.updateLayerOptions(2, { dynamic: true });
  } else if (ev.data.type === MsgUpdateSvelteState) {
    // set svelte state to graph, it's just a simple copy.
    // if you don't like state style, you can directly change the elements.
    // declarative style or command style are supported at the same time.
    svelteState.count = ev.data.msg;
    // ask to redraw only the second layer.
    graph.render(1);
  }
};