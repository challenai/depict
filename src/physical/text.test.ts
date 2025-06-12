import { describe, it, expect } from "bun:test";
import {
  cutLastLine,
  seperateText2MultiLines,
} from "./text";

function mockWidthCalculator(max: number) {
  // Each character is 1 unit wide, up to max
  return (text: string, start: number, end?: number) => {
    const len = (end !== undefined ? end : text.length) - start;
    return Math.min(len, max + 1); // +1 so we can test overflow
  };
}

describe("cutLastLine", () => {
  it("returns full substring if it fits", () => {
    const text = "hello";
    const width = 10;
    const result = cutLastLine(text, width, 0, mockWidthCalculator(width));
    expect(result).toBe("hello");
  });

  it("cuts and adds ellipsis if needed", () => {
    const text = "hello world";
    const width = 5;
    const result = cutLastLine(text, width, 0, mockWidthCalculator(width), false, true);
    expect(result.endsWith("...")).toBe(true);
  });

  it("cuts at word boundary if wordBased", () => {
    const text = "hello world";
    const width = 5;
    const result = cutLastLine(text, width, 0, mockWidthCalculator(width), true, false);
    expect(result).toMatch(/hello/);
  });
});

describe("seperateText2MultiLines", () => {
  it("splits text into multiple lines", () => {
    const text = "hello world again";
    const width = 5;
    const lines = seperateText2MultiLines(text, width, mockWidthCalculator(width), 2);
    expect(lines.length).toBe(2);
    expect(lines[0].length).toBeLessThanOrEqual(width + 1);
  });

  it("trims leading spaces on new lines", () => {
    const text = "hello   world";
    const width = 5;
    const lines = seperateText2MultiLines(text, width, mockWidthCalculator(width), 2);
    expect(lines[1].startsWith("world")).toBe(true);
  });

  it("applies ellipsis on last line if requested", () => {
    const text = "hello world again";
    const width = 5;
    const lines = seperateText2MultiLines(text, width, mockWidthCalculator(width), 2, false, true);
    expect(lines[1].endsWith("...")).toBe(true);
  });

  it("handles wordBased splitting", () => {
    const text = "hello world again";
    const width = 5;
    const lines = seperateText2MultiLines(text, width, mockWidthCalculator(width), 2, true);
    expect(lines.length).toBe(2);
  });
});