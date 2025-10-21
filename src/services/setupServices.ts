import { OpenAPI } from "./openapi";
import { SecureStorageService } from "./secure-storage.service";

/**
 * Simple OpenAPI configuration similar to your other project
 * This replaces the complex enhanced-api-client system
 */

// Configure OpenAPI token resolver
OpenAPI.TOKEN = async () => {
  const { accessToken } = await SecureStorageService.getTokens();
  return accessToken || "";
};

// Import API config to ensure consistent URL usage
import { API_CONFIG } from "../config/api";

// Configure base URL from environment
OpenAPI.BASE = API_CONFIG.BASE_URL;

// Enable credentials for authentication
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.CREDENTIALS = "include";

// Debug logging in development
if (import.meta.env.DEV) {
  console.log("🔧 OpenAPI Configuration:", {
    BASE_URL: OpenAPI.BASE,
    ENVIRONMENT: import.meta.env.MODE,
    ENV_VARS: import.meta.env,
  });
}

// Export a simple initialization function
export const setupServices = () => {
  console.log("✅ OpenAPI services configured");
  console.log("📡 API Base URL:", OpenAPI.BASE);
  console.log(
    "🔐 Token resolver:",
    OpenAPI.TOKEN ? "Configured" : "Not configured"
  );
};
