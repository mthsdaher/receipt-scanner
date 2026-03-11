import { ApiClientError, apiClient } from "./apiClient";

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

const mockFetchResponse = (response: MockResponse): void => {
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue(response as Response);
};

describe("apiClient", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it("returns parsed payload on success and sends auth header", async () => {
    localStorage.setItem("token", "jwt-token");
    mockFetchResponse({
      ok: true,
      status: 200,
      json: async () => ({ status: "success", data: { value: 1 } }),
    });

    const payload = await apiClient.get<{ status: string; data: { value: number } }>("/api/test");

    expect(payload.status).toBe("success");
    expect(payload.data.value).toBe(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3002/api/test",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("throws ApiClientError with requestId and calls onUnauthorized on 401", async () => {
    const onUnauthorized = jest.fn();
    mockFetchResponse({
      ok: false,
      status: 401,
      json: async () => ({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
        requestId: "req-123",
      }),
    });

    await expect(apiClient.get("/api/private", onUnauthorized)).rejects.toEqual(
      expect.objectContaining({
        name: "ApiClientError",
        status: 401,
        code: "UNAUTHORIZED",
        requestId: "req-123",
        message: "Not authenticated (request: req-123)",
      })
    );
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("handles invalid json error payloads gracefully", async () => {
    mockFetchResponse({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("invalid json");
      },
    });

    await expect(apiClient.get("/api/broken")).rejects.toEqual(
      expect.objectContaining<ApiClientError>({
        status: 500,
        message: "Invalid response from server",
      })
    );
  });
});
