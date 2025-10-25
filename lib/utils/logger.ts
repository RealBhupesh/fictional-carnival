export const log = (
  message: string,
  payload?: Record<string, unknown> | Array<unknown> | string
) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[LOG] ${message}`, payload ?? "");
  }
};

export const logError = (message: string, error: unknown) => {
  console.error(`[ERROR] ${message}:`, error);
};
