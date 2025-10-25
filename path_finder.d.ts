// path_finder.d.ts

export interface PairIntInt {
  first: number;
  second: number;
}

export interface VectorPairIntInt {
  size(): number;
  get(index: number): PairIntInt;
  delete(): void;
}

export interface VectorVectorInt {
  push_back(item: VectorInt): void;
  delete(): void;
}

export interface VectorInt {
  push_back(item: number): void;
  delete(): void;
}

export interface PathFinderModule {
  find_path(grid_size: number, blocked: VectorVectorInt, start: PairIntInt, end: PairIntInt, method: 'dfs' | 'bfs' | 'astar'): VectorPairIntInt;
  VectorVectorInt: { new(): VectorVectorInt; };
  VectorInt: { new(): VectorInt; };
  find_path_streaming(grid_size: number, blocked: VectorVectorInt, start: PairIntInt, end: PairIntInt, method: 'astar', callback: (r: number, c:number) => void): void;
}

export default function createPathFinderModule(): Promise<PathFinderModule>;
