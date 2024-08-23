import type { Mesh, MeshOptions, Text, TextOptions } from './drawable';

export abstract class Renderer {
  abstract mesh(shape: Mesh, opts?: MeshOptions): void
};

export abstract class Writer {
  abstract write(text: Text, opts?: TextOptions): void
}