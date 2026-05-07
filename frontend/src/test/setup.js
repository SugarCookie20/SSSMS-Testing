import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock window functions that are not in jsdom
window.URL.createObjectURL = vi.fn();
window.URL.revokeObjectURL = vi.fn();

// Mock scrollTo
window.scrollTo = vi.fn();

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
