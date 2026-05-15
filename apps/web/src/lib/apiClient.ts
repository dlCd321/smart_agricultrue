import type { ApiResponse, HealthResponse } from "@agriculture/shared";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export async function getHealth(): Promise<ApiResponse<HealthResponse>> {
  const response = await fetch(`${apiBaseUrl}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<HealthResponse>>;
}
