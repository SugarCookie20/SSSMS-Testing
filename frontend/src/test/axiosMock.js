import { vi } from "vitest";

export const mockAxios = {
  get: vi.fn().mockResolvedValue({ data: {} }),
  post: vi.fn().mockResolvedValue({ data: {} }),
  put: vi.fn().mockResolvedValue({ data: {} }),
  delete: vi.fn().mockResolvedValue({ data: {} }),
  create: vi.fn(function() { return this; }),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
};

vi.mock("axios", () => ({
  default: mockAxios,
  ...mockAxios
}));

// Mock our custom axiosInstance
vi.mock("@/api/axiosInstance", () => ({
  default: mockAxios,
  BASE_URL: "/api"
}));
