// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
interface WasmModule {
  _sum(_0: number, _1: number): number;
}

export type MainModule = WasmModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
