import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import { webcrypto } from "node:crypto";

// Node.js test environment では globalThis.crypto を webcrypto に紐付け（jsdom が無いと不足する API があるため）
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}
