import type { Registry } from "@bufbuild/protobuf";

export interface Options {
  maxDepth: number;
  registry?: Registry;
  listMin: number;
  listMax: number;
  mapMin: number;
  mapMax: number;
  bytesMin: number;
  bytesMax: number;
}

export function makeOptions(opt: Partial<Options> | undefined): Options {
  return {
    ...opt,
    maxDepth: opt?.maxDepth ?? 4,
    bytesMin: opt?.bytesMin ?? 0,
    bytesMax: opt?.bytesMax ?? 256,
    listMin: opt?.listMin ?? 0,
    listMax: opt?.listMax ?? 8,
    mapMin: opt?.mapMin ?? 0,
    mapMax: opt?.mapMax ?? 8,
  };
}
