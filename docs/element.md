# Building Blocks

## Layers

The Depict graph is seperated to some layers, they could be dynamic or static.  
A static layer will not re-render automatically, but the dynamic one will re-render each frame.
The static layer (default layer) can be updated and re-rendered by a `renderLayer` or `renderAll` request.  
ShadowElements are the basic components of the graph, each layer contains a group of ShadowElements.  

## ShadowElement

ShadowElements are the core concepts of Depict.   
They are the foundation upon which you build your graphs, which makes them the perfect place to start your journey!

### Simple Element

The graphs in Depict is organized as some **ShadowElement** trees.   

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

You can add unlimited shapes to a ShadowElement,  
you can also add some texts to the element,  
so an element could be a button, a card.  

If one element is not enough, build your component with 2 elements, or 20 elements.  
The element itself is just a plain Javascript object, 
so that the user can easily debug and print, the cost is quite low too.  

### draw your own shape with context

You can also draw the shapes with commands or customed function.  

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

But the internal **shapes: Mesh[]** field is first-class for performance.    
If you draw the elements by commands, no optimization will be applied to the render process,   
that means the render process will be like drawing with plain Javascript, run function one by one,  
the graph will not be rendered in a batch, merge duplicated styles, or further optimize.  
In most of the case, it's **fast enough**.

## other useful fields 

### absolute

You can set the position of current element absolute, have no relationship with its parent.

### hidden

Hide the element or show it.

### data

Used for saving your own data, you can save anything, for example: the name of the current element for debug.

### layerUp

Mark current element is just copied pointer which actually lives in a different layer
That means this element is seperated with its parent.
