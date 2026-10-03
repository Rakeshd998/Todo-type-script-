// Extract a readable message from an RTK Query error.
// The API responds with { success: false, message, errors?: string[] }.
export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string; errors?: string[] } }).data;
    if (data?.errors?.length) return data.errors[0];
    if (data?.message) return data.message;
  }
  return fallback;
};
