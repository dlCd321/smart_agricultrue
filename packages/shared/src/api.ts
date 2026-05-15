export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T | null;
  timestamp: string;
  traceId: string;
};

export type HealthResponse = {
  status: "ok";
  service: string;
  version: string;
};

export type ColorToken = "blue" | "green" | "yellow" | "orange" | "red";

export type FarmBlockSummary = {
  blockId: string;
  blockNo: number;
  blockName: string;
  grid: {
    row: number;
    col: number;
  };
  displayValue: string;
  colorToken: ColorToken;
  colorHex: string;
  normalizedHeight: number;
};
