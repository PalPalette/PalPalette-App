import { httpInterceptor } from "./http-interceptor.service";

/**
 * Initialize the HTTP interceptor for automatic token refresh
 * Call this once in your main.tsx before rendering the app
 *
 * The HTTP interceptor will automatically handle token refresh for ALL API calls,
 * including those from the OpenAPI services, without requiring any code changes!
 */
export const initializeApiServices = async () => {
  console.log("🚀 Initializing API services...");

  // Initialize the HTTP interceptor (this sets up global fetch interception)
  // This will automatically intercept ALL fetch requests, including OpenAPI calls
  const interceptor = httpInterceptor;

  // Suppress unused variable warnings
  void interceptor;

  console.log(
    "✅ HTTP Interceptor initialized - ALL API calls now have automatic token refresh!"
  );
};

// Re-export for convenience
export { enhancedApiClient } from "./enhanced-api-client";
export { SecureStorageService } from "./secure-storage.service";
export { httpInterceptor } from "./http-interceptor.service";
