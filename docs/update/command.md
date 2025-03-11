# Command Driven

You can set properties of the node immediately when an event is triggered.

```js
const node = {
    x: 0,
    y: 0,
    shapes: [rect],
    contain(x, y) {
        return x >= 0 && x <= w && y >= 0 && y <= h;
    },
    onClick(render, x, y, mx, my) {
        rect.opts.fill = "#000";
        // ask for re-render
        render();
    }
};
```