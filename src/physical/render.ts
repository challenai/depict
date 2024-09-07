import type { Mesh, Text } from './drawable';

// Renderer render meshes and write texts
export abstract class Renderer {
  // draw meshes
  abstract draw(shape: Mesh): void
  // write texts
  abstract write(text: Text): void
  // move current draw cursor to given coordinates
  abstract offset(x: number, y: number): void
};