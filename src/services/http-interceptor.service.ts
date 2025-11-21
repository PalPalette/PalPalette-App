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

// Global reference to AuthContext refresh function
let globalRefreshTokensFn: (() => Promise<boolean>) | null = null;

export function setAuthRefreshFunction(refreshFn: () => Promise<boolean>) {
  globalRefreshTokensFn = refreshFn;
}

/**
 * HTTP Interceptor Service for automatic token refresh
 * This service intercepts all API calls and handles token refresh automatically
 * Now simplified to delegate to AuthContext
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
        console.error("Network error in interceptor:", {
          error,
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : typeof error,
          stack: error instanceof Error ? error.stack : undefined,
          url:
            typeof input === "string"
              ? input
              : input instanceof URL
              ? input.href
              : "Request object",
        });
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
   * Handle 401 unauthorized responses by calling AuthContext refresh
   */
  private async handleUnauthorized(): Promise<string | null> {
    if (!globalRefreshTokensFn) {
      console.error("❌ Auth refresh function not registered");
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
      console.log("🔄 Calling AuthContext refreshTokens...");

      // Add timeout to refresh attempt (10 seconds)
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(
          () => reject(new Error("Token refresh timeout after 10 seconds")),
          10000
        );
      });

      // Race between refresh and timeout
      const success = await Promise.race([
        globalRefreshTokensFn(),
        timeoutPromise,
      ]);

      if (success) {
        // Get the new token
        const { accessToken } = await SecureStorageService.getTokens();

        if (accessToken) {
          // Process queued requests
          this.processQueue(null, accessToken);
          console.log("✅ Token refresh successful");
          return accessToken;
        }
      }

      throw new Error("Token refresh failed");
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      this.processQueue(error as Error, null);
      return null;
    } finally {
      this.isRefreshing = false;
    }
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
