import type { Mesh, Text } from './drawable';

export abstract class Renderer {
  abstract draw(shape: Mesh): void
  abstract write(text: Text): void
};