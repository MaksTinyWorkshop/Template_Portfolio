import { JSDOM } from "jsdom";
import { vi } from "vitest";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
});

vi.mock("html-encoding-sniffer", () => ({
  sniff: () => "UTF-8",
}));

globalThis.window = dom.window as unknown as Window & typeof globalThis;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;

globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
globalThis.CustomEvent = dom.window.CustomEvent;

if (typeof globalThis.matchMedia !== "function") {
  const matchMediaMock = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });

  globalThis.matchMedia = matchMediaMock;
}

const storage: Record<string, string> = {};
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = String(value);
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
  },
});

if (!globalThis.fetch) {
  globalThis.fetch = (input: string | URL | Request, init?: RequestInit) =>
    dom.window.fetch(input as RequestInfo, init) as Promise<Response>;
}

vi.mock("next/font/local", () => ({
  __esModule: true,
  default: vi.fn(() => () => ({ className: "font-mock" })),
}));
