// path_finder.d.ts

/**
 * Describes the C++ std::pair<int, int>
 * Because it's a 'value_object', any copy returned to JS
 * must be manually deleted.
 */
export interface PairIntInt {
  first: number;
  second: number;
}

/**
 * Describes the C++ std::vector<std::pair<int, int>>
 * This wrapper object must also be manually deleted.
 */
export interface VectorPairIntInt {
  size(): number;
  get(index: number): PairIntInt;
  delete(): void;
  // You could also add: push_back(pair: PairIntInt), etc.
}

/**
 * Represents a C++ std::vector<std::vector<int>>.
 * This wrapper object must also be manually deleted.
 */
export interface VectorVectorInt {
  push_back(item: VectorInt): void;
  delete(): void;
}

/**
 * Represents a C++ std::vector<int>.
 * This wrapper object must also be manually deleted.
 */
export interface VectorInt {
  push_back(item: number): void;
  delete(): void;
}

/**
 * Describes the main module instance that
 * contains all your exported functions.
 */
export interface PathFinderModule {
  dfs(blocked: VectorVectorInt, start: PairIntInt, end: PairIntInt, grid_size: number): VectorPairIntInt;
  VectorVectorInt: { new(): VectorVectorInt; };
  VectorInt: { new(): VectorInt; };
}

/**
 * Describes the default export from path_finder.js
 * It's a factory function that returns a Promise
 * which resolves to your module instance.
 */
export default function createPathFinderModule(): Promise<PathFinderModule>;
