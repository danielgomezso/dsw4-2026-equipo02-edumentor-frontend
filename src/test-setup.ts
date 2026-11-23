import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  const datos = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (clave: string) => datos.get(clave) ?? null,
    setItem: (clave: string, valor: string) => datos.set(clave, String(valor)),
    removeItem: (clave: string) => datos.delete(clave),
    clear: () => datos.clear(),
    key: (indice: number) => [...datos.keys()][indice] ?? null,
    get length() { return datos.size; },
  });
});

afterEach(() => vi.unstubAllGlobals());
