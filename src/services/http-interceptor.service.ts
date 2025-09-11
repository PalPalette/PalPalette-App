import { OpenAPI } from "./openapi";
import { SecureStorageService } from "./secure-storage.service";
import { ApiError } from "./openapi/core/ApiError";

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}

/**
 * HTTP Interceptor Service for automatic token refresh
 * This service intercepts all API calls and handles token refresh automatically
 */
export class HttpInterceptorService {
  private static instance: HttpInterceptorService;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  private constructor() {
    this.setupInterceptor();
  }

  public static getInstance(): HttpInterceptorService {
    if (!HttpInterceptorService.instance) {
      HttpInterceptorService.instance = new HttpInterceptorService();
    }
    return HttpInterceptorService.instance;
  }

  /**
   * Setup the fetch interceptor
   */
  private setupInterceptor() {
    // Store original fetch
    const originalFetch = window.fetch;

    // Override fetch globally
    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      // Get the current access token
      const { accessToken } = await SecureStorageService.getTokens();

      // Create request with token
      const requestInit = this.createRequestWithAuth(init, accessToken);

      try {
        // Make the request
        const response = await originalFetch(input, requestInit);

        // If unauthorized and we have a refresh token, try to refresh
        if (response.status === 401) {
          console.log("🔄 Received 401, attempting token refresh...");

          const newToken = await this.handleUnauthorized();

          if (newToken) {
            // Retry with new token
            const retryInit = this.createRequestWithAuth(init, newToken);
            console.log("✅ Retrying request with new token...");
            return await originalFetch(input, retryInit);
          } else {
            // If refresh failed, let the 401 through
            console.log("❌ Token refresh failed, letting 401 through");
            return response;
          }
        }

        return response;
      } catch (error) {
        console.error("Network error in interceptor:", error);
        throw error;
      }
    };
  }

  /**
   * Create request init with authorization header
   */
  private createRequestWithAuth(
    init?: RequestInit,
    token?: string | null
  ): RequestInit {
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return {
      ...init,
      headers,
    };
  }

  /**
   * Handle 401 unauthorized responses
   */
  private async handleUnauthorized(): Promise<string | null> {
    const { refreshToken } = await SecureStorageService.getTokens();

    if (!refreshToken) {
      console.log("❌ No refresh token available");
      this.notifySessionExpired();
      return null;
    }

    if (this.isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      console.log("🔄 Refreshing tokens...");

      // Call refresh endpoint directly using the original fetch
      const response = await this.originalFetch("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokenData: TokenRefreshResponse = await response.json();

      // Store new tokens
      await SecureStorageService.storeTokens(
        tokenData.access_token,
        tokenData.refresh_token
      );
      await SecureStorageService.storeUser(tokenData.user);

      // Process queued requests
      this.processQueue(null, tokenData.access_token);

      console.log("✅ Token refresh successful");
      return tokenData.access_token;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);

      // Clear tokens and notify session expired
      await SecureStorageService.clearTokens();
      this.processQueue(error as Error, null);
      this.notifySessionExpired();

      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Original fetch method (without interception)
   */
  private async originalFetch(
    url: string,
    init?: RequestInit
  ): Promise<Response> {
    const baseUrl = OpenAPI.BASE || "http://localhost:3000";
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

    return fetch(fullUrl, {
      ...init,
      credentials: "include",
    });
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: Error | null, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error("Token refresh failed"));
      }
    });

    this.failedQueue = [];
  }

  /**
   * Notify the app that the session has expired
   */
  private notifySessionExpired() {
    console.log("🚪 Session expired - dispatching event");

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("auth:sessionExpired", {
        detail: { reason: "Token refresh failed" },
      })
    );
  }

  /**
   * Wrapper for API calls that ensures proper error handling
   */
  public async apiCall<T>(apiFunction: () => Promise<T>): Promise<T> {
    try {
      return await apiFunction();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        console.log(
          "🔄 API call received 401, token refresh should have been handled by interceptor"
        );
        // The interceptor should have already handled this, but just in case
        throw new Error("Authentication failed - please login again");
      }
      throw error;
    }
  }
}

// Initialize the interceptor singleton
export const httpInterceptor = HttpInterceptorService.getInstance();
