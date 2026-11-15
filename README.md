# Painter

A browser-based digital painting studio built with React, Vite, and the HTML canvas.

## Run locally

```sh
npm install
npm run dev
```

## Features

- Freehand brush and pencil, eraser, bucket fill, and color picker
- Line, rectangle, ellipse, triangle, rounded rectangle, and arrow tools
- Brush size and opacity controls, color swatches, and a custom color picker
- Multiple layers with visibility, opacity, rename, reorder, copy, and duplicate controls
- Undo and redo, canvas resizing, zoom, and clear-layer action
- Open image files or Painter project files; save projects to local storage
- Export artwork as PNG, JPG, or SVG, or download a `.painter` project

SVG export embeds the raster canvas image in an SVG document; it does not convert brush strokes into vector paths.
