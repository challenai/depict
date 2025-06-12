import { beforeEach, describe, expect, it, vi } from "bun:test";
import type { Text, TextRect } from "../physical/drawable";
import type { Renderer } from "../physical/render";
import { Graph } from "./graph";

describe("Graph", () => {
  let graph: Graph;

  beforeEach(() => {
    // Mock Layer class with minimal implementation
    class MockLayer {
      public defaultRenderer: Renderer | undefined = undefined;
      render = vi.fn();
      boundingBox = vi.fn(
        (_text: Text, _renderer?: Renderer): TextRect => ({
          width: 42,
          height: 24,
        }),
      );
      setDefaultRenderer = vi.fn();
      updateQueue = vi.fn();
      resetQueue = vi.fn();
      updateOptions = vi.fn();
      resize = vi.fn();
      triggerEvent = vi.fn(() => false);
    }
    // @ts-ignore
    globalThis.Layer = MockLayer;

    // Mock OffscreenCanvas
    graph = new Graph();
    // @ts-ignore
    graph.layers = [new MockLayer(), new MockLayer()];
  });

  it("should render all layers", () => {
    graph.renderAll();
    for (const layer of graph.layers) {
      expect(layer.render).toHaveBeenCalled();
    }
  });

  it("should call boundingBox on the correct layer", () => {
    const text = {} as Text;
    const rect = graph.boundingBox(text, { layer: 1 });
    expect(rect).toEqual({ width: 42, height: 24 });
    expect(graph.layers[1].boundingBox).toHaveBeenCalledWith(text, undefined);
  });

  it("should not throw if invalid layer index is given to boundingBox", () => {
    const text = {} as Text;
    const rect = graph.boundingBox(text, { layer: 99 });
    expect(rect).toEqual({ width: 0, height: 0 });
  });

  it("should set default renderer for a specific layer", () => {
    const renderer = {} as Renderer;
    graph.setLayerRenderer(0, renderer);
    expect(graph.layers[0].setDefaultRenderer).toHaveBeenCalledWith(renderer);
  });

  it("should set default renderer for all layers", () => {
    const renderer = {} as Renderer;
    graph.setGraphRenderer(renderer);
    for (const layer of graph.layers) {
      expect(layer.setDefaultRenderer).toHaveBeenCalledWith(renderer);
    }
  });

  it("should update queue for a valid layer", () => {
    const elements = [{}];
    graph.updateQueue(0, elements as any);
    expect(graph.layers[0].updateQueue).toHaveBeenCalledWith(elements);
  });

  it("should not update queue for invalid layer", () => {
    const elements = [{}];
    expect(() => graph.updateQueue(99, elements as any)).not.toThrow();
  });

  it("should reset queue for a valid layer", () => {
    const elements = [{}];
    graph.resetQueue(0, elements as any);
    expect(graph.layers[0].resetQueue).toHaveBeenCalledWith(elements);
  });

  it("should update layer options for a valid layer", () => {
    const options = { dynamic: true };
    graph.updateLayerOptions(0, options as any);
    expect(graph.layers[0].updateOptions).toHaveBeenCalledWith(options);
  });

  it("should update graph options for all layers", () => {
    const options = [{ dynamic: true }, { dynamic: false }];
    graph.updateGraphOptions(options as any);
    expect(graph.layers[0].updateOptions).toHaveBeenCalledWith(options[0]);
    expect(graph.layers[1].updateOptions).toHaveBeenCalledWith(options[1]);
  });

  it("should get the default renderer of a layer", () => {
    const renderer = {} as Renderer;
    graph.layers[0].defaultRenderer = renderer;
    expect(graph.getRenderer(0)).toBe(renderer);
  });

  it("should return undefined for getRenderer with invalid layer", () => {
    expect(graph.getRenderer(99)).toBeUndefined();
  });
});
