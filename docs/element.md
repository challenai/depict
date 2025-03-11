# Building Blocks

## Layers

The Depict graph is divided into multiple layers, which can be either **dynamic** or **static**.  
- A **static layer** (default) does not re-render automatically but can be updated manually using `renderLayer` or `renderAll`.  
- A **dynamic layer** re-renders every frame.  

Each layer contains a group of **ShadowElements**, which serve as the building blocks of the graph.

---

## ShadowElement

**ShadowElements** are the core components of Depict.  
They form the foundation of your graphs, making them the perfect starting point.

### Simple Element Structure

Graphs in Depict are organized as **ShadowElement** trees.

```js
// ShadowElement
const se = {
    x: 10,
    y: 5,
    shapes: [
        {
            path: "M 20 20 l 0 100",
            opts: {
                stroke: "#666",
                fill: "#333",
            }
        },
    ],
    children: [node001, node002, ...],
};
```

- You can add unlimited shapes to a ShadowElement.
- You can also add text, making it function as a button, card, or other UI element.
- If a single element isn't enough, compose it using multiple elements.
- Since elements are plain JavaScript objects, debugging is simple and memory usage is minimal.

### Drawing Custom Shapes with Context

You can draw shapes using commands or a custom function.

```js
// ShadowElement: draw with commands
const se = {
    x: 10,
    y: 5,
    postRenderCallback(ctx, offscreen) {
        // draw a rectangle with command
        ctx.beginPath();
        ctx.rect(20, 20, 150, 100);
        ctx.stroke();
    },
    children: [node001, node002, ...],
};
```

However, the built-in `shapes: Mesh[]` field is optimized for performance.
If you draw using custom commands, no automatic optimizations will be applied.
This means:

- The rendering process executes JavaScript functions one by one.
- The graph won't batch render, merge duplicate styles, or apply other optimizations.
In most cases, it's **fast enough**.

## Other Useful Fields

### absolute

Sets the element’s position to be absolute, independent of its parent.

### hidden

Controls whether the element is visible or hidden.

### data

Stores custom data (e.g., element names for debugging).

### layerUp

Indicates that the element is a copied reference from a different layer, making it independent of its parent.
