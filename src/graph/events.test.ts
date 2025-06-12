import { describe, it, expect, beforeEach } from "bun:test";
import { BinaryEventHandler } from "./events";

function createShadowElement(idx: number, opts: Partial<any> = {}) {
  return {
    _state: { idx, dx: 0, dy: 0, destroy: false, ...opts._state },
    x: 0,
    y: 0,
    hidden: false,
    contain: opts.contain ?? (() => false),
    ...opts,
  };
}

describe("BinaryEventHandler", () => {
  let handler: BinaryEventHandler;

  beforeEach(() => {
    handler = new BinaryEventHandler();
  });

  it("should add elements in sorted order by _state.idx", () => {
    const el1 = createShadowElement(2);
    const el2 = createShadowElement(1);
    const el3 = createShadowElement(3);

    handler.add(el1);
    handler.add(el2);
    handler.add(el3);

    expect(handler.elements.map(e => e._state.idx)).toEqual([1, 2, 3]);
  });

  it("should trigger the correct element", () => {
    const el1 = createShadowElement(1, { contain: () => false });
    const el2 = createShadowElement(2, { contain: () => true });

    handler.add(el1);
    handler.add(el2);

    const result = handler.trigger(0, 0);
    expect(result).toBe(el2);
  });

  it("should triggerAll and return all matching elements", () => {
    const el1 = createShadowElement(1, { contain: () => true });
    const el2 = createShadowElement(2, { contain: () => true });
    const el3 = createShadowElement(3, { contain: () => false });

    handler.add(el1);
    handler.add(el2);
    handler.add(el3);

    const result = handler.triggerAll(0, 0);
    expect(result).toContain(el1);
    expect(result).toContain(el2);
    expect(result).not.toContain(el3);
  });

  it("should skip hidden elements and remove destroyed elements", () => {
    const el1 = createShadowElement(1, { hidden: true, contain: () => true });
    const el2 = createShadowElement(2, { _state: { idx: 2, destroy: true, dx: 0, dy: 0 }, contain: () => true });
    const el3 = createShadowElement(3, { contain: () => true });

    handler.add(el1);
    handler.add(el2);
    handler.add(el3);

    // el2 should be removed, el1 should be skipped, only el3 should be returned
    const result = handler.triggerAll(0, 0);
    expect(result).toEqual([el3]);
    expect(handler.elements).not.toContain(el2);
  });

  it("should clear all elements", () => {
    handler.add(createShadowElement(1));
    handler.add(createShadowElement(2));
    handler.clear();
    expect(handler.elements.length).toBe(0);
  });
});