import { OpenAPI } from "./openapi";
import { AuthenticationService, AuthResponseDto } from "./openapi";
import { API_CONFIG } from "../config/api";
import { SecureStorageService } from "./secure-storage.service";
import { httpInterceptor } from "./http-interceptor.service";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserData {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthResponse extends AuthTokens {
  user: UserData;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

export interface Session {
  deviceName?: string;
  ipAddress?: string;
  createdAt: string;
  lastUsedAt?: string;
}

/**
 * Enhanced API client that handles the new authentication flow
 */
class EnhancedApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenValidationInterval: NodeJS.Timeout | null = null;
  private isValidatingToken = false;
  private onSessionExpiredCallback: (() => void) | null = null;

  constructor() {
    this.initializeClient();
    // Load tokens asynchronously - don't block constructor
    this.loadTokensFromStorage().catch((error) =>
      console.error("Failed to load tokens during initialization:", error)
    );
    // Note: No periodic validation needed - HTTP interceptor handles on-demand refresh
  }

  /**
   * Initialize the OpenAPI client configuration
   */
  private initializeClient() {
    // Configure base URL
    OpenAPI.BASE = API_CONFIG.BASE_URL;
    OpenAPI.WITH_CREDENTIALS = true;
    OpenAPI.CREDENTIALS = "include";

    // Set up dynamic token resolver
    OpenAPI.TOKEN = async () => {
      const { accessToken } = await SecureStorageService.getTokens();
      return accessToken || "";
    };
  }

  /**
   * Load stored tokens on initialization
   */
  private async loadTokensFromStorage() {
    try {
      const { accessToken, refreshToken } =
        await SecureStorageService.getTokens();
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.warn("Failed to load tokens from secure storage:", error);
    }
  }

  /**
   * Save tokens to storage
   */
  private async saveTokensToStorage(tokens: AuthResponseDto) {
    try {
      await SecureStorageService.storeTokens(
        tokens.access_token,
        tokens.refresh_token
      );
      await SecureStorageService.storeUser(tokens.user);

      // Also save to memory for quick access
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
    } catch (error) {
      console.error("Failed to save tokens to secure storage:", error);
    }
  }

  /**
   * Clear tokens from storage
   */
  private async clearTokensFromStorage() {
    try {
      await SecureStorageService.clearTokens();
      this.accessToken = null;
      this.refreshToken = null;
    } catch (error) {
      console.error("Failed to clear tokens from secure storage:", error);
    }
  }

  /**
   * Start periodic token validation
   * Checks token validity every 5 minutes and refreshes if needed
   */
  private startTokenValidation() {
    // Clear any existing interval
    if (this.tokenValidationInterval) {
      clearInterval(this.tokenValidationInterval);
    }

    // Check token validity every 5 minutes (300,000 ms)
    this.tokenValidationInterval = setInterval(() => {
      this.validateAndRefreshToken();
    }, 5 * 60 * 1000); // 5 minutes

    // Also validate immediately if we have tokens
    if (this.accessToken && this.refreshToken) {
      setTimeout(() => this.validateAndRefreshToken(), 1000); // Validate after 1 second
    }
  }

  /**
   * Stop periodic token validation
   */
  private stopTokenValidation() {
    if (this.tokenValidationInterval) {
      clearInterval(this.tokenValidationInterval);
      this.tokenValidationInterval = null;
    }
  }

  /**
   * Validate current token and refresh if needed
   */
  private async validateAndRefreshToken(): Promise<void> {
    // Skip if already validating or no tokens available
    if (this.isValidatingToken || !this.accessToken || !this.refreshToken) {
      return;
    }

    this.isValidatingToken = true;

    try {
      console.log("🔍 Validating token...");

      // Use the validate endpoint to check token validity
      await AuthenticationService.authControllerValidate({
        token: this.accessToken,
      });

      console.log("✅ Token is still valid");
    } catch (error) {
      console.log("🔄 Token validation failed, attempting refresh...", error);

      try {
        // Token is invalid, try to refresh
        await this.refreshAccessToken();
        console.log("✅ Token refreshed successfully");

        // Notify that session is still active
        this.notifySessionActive();
      } catch (refreshError) {
        console.log("❌ Token refresh failed, session expired", refreshError);

        // Refresh failed, clear tokens and notify session expired
        this.clearTokensFromStorage();
        this.stopTokenValidation();
        this.notifySessionExpired();
      }
    } finally {
      this.isValidatingToken = false;
    }
  }

  /**
   * Set callback for session expiry notifications
   */
  setOnSessionExpiredCallback(callback: () => void) {
    this.onSessionExpiredCallback = callback;
  }

  /**
   * Notify that session has expired
   */
  private notifySessionExpired() {
    console.log("🚪 Session expired - user will be logged out");
    if (this.onSessionExpiredCallback) {
      this.onSessionExpiredCallback();
    }
  }

  /**
   * Notify that session is still active (after refresh)
   */
  private notifySessionActive() {
    console.log("🔐 Session refreshed - user remains logged in");
    // You could emit an event here for UI notifications if needed
  }

  /**
   * Generate device name from user agent
   */
  private getDeviceName(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("iPad")) return "iPad";
    if (userAgent.includes("Android")) return "Android Device";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Windows")) return "Windows PC";
    if (userAgent.includes("Linux")) return "Linux PC";

    return "Web Browser";
  }

  /**
   * Get user agent string for API calls
   */
  private getUserAgent(): string {
    return navigator.userAgent || "PalPalette-Web-Client";
  }

  /**
   * Login with enhanced authentication
   */
  async login(credentials: LoginCredentials): Promise<AuthResponseDto> {
    const deviceName = credentials.device_name || this.getDeviceName();
    const userAgent = this.getUserAgent();

    try {
      const loginData = {
        email: credentials.email,
        password: credentials.password,
        device_name: deviceName,
      };

      const response = await AuthenticationService.authControllerLogin(
        userAgent,
        loginData
      );

      await this.saveTokensToStorage(response);

      // No need to start periodic validation - interceptor handles it
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const userAgent = this.getUserAgent();
      const response = await AuthenticationService.authControllerRefresh(
        userAgent,
        { refresh_token: this.refreshToken }
      );

      await this.saveTokensToStorage(response);
      return response.access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await this.clearTokensFromStorage();
      throw error;
    }
  }

  /**
   * Logout and invalidate tokens
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if we have a token
      if (this.accessToken) {
        await AuthenticationService.authControllerLogout();
      }
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      await this.clearTokensFromStorage();
    }
  }

  /**
   * Get active sessions for the current user
   */
  async getActiveSessions(): Promise<Session[]> {
    try {
      const response =
        await AuthenticationService.authControllerGetActiveSessions();
      return response.sessions || [];
    } catch (error) {
      console.error("Failed to get active sessions:", error);
      throw error;
    }
  }

  /**
   * Revoke access for a specific device
   */
  async revokeDeviceAccess(deviceName: string): Promise<void> {
    try {
      await AuthenticationService.authControllerRevokeDevice({
        device_name: deviceName,
      });
    } catch (error) {
      console.error("Failed to revoke device access:", error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get current user data
   */
  async getUser(): Promise<UserData | null> {
    try {
      const user = await SecureStorageService.getUser();
      return user as UserData | null;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Universal API call wrapper with automatic token refresh
   * Use this for any API call that might need token refresh
   * Note: With the HTTP interceptor, this is mostly for compatibility
   */
  async apiCall<T>(apiFunction: () => Promise<T>): Promise<T> {
    return httpInterceptor.apiCall(apiFunction);
  }
}

// Create and export singleton instance
export const enhancedApiClient = new EnhancedApiClient();

// Legacy exports for backward compatibility
export const configureApiClient = () => {
  console.log("✅ Enhanced API client is already configured");
};

export const setApiToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
};

export const getApiToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const clearApiToken = () => {
  localStorage.removeItem("auth_token");
};
