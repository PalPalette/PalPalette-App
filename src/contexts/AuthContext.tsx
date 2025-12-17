import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { App } from "@capacitor/app";
import { AuthenticationService } from "../services/openapi";
import { PushNotificationsService } from "../services/openapi";
import { PushService } from "../services/PushService";
import { SecureStorageService } from "../services/secure-storage.service";
import { setAuthRefreshFunction } from "../services/http-interceptor.service";

export interface User {
  id: string;
  email: string;
  displayName: string;
}

// Auth state machine: clear state transitions
export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

export interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (
    email: string,
    password: string,
    deviceName?: string
  ) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const isLoggingOut = useRef(false);
  const refreshTokensRef = useRef<(() => Promise<boolean>) | null>(null);

  /**
   * Check if token is expired or expiring soon
   */
  const isTokenExpiringSoon = useCallback(
    (expiresAt: number | null): boolean => {
      if (!expiresAt) return false;

      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const fiveMinutes = 5 * 60 * 1000;

      // Return true if token expires in less than 5 minutes
      return timeUntilExpiry < fiveMinutes;
    },
    []
  );

  /**
   * Check if token is completely expired
   */
  const isTokenExpired = useCallback((expiresAt: number | null): boolean => {
    if (!expiresAt) return false;
    return Date.now() >= expiresAt;
  }, []);

  /**
   * Helper to clear auth state (used by logout and token refresh failure)
   */
  const clearAuthState = useCallback(async () => {
    if (isLoggingOut.current) {
      return; // Prevent concurrent logout calls
    }

    isLoggingOut.current = true;

    try {
      await SecureStorageService.clearTokens();
      setToken(null);
      setRefreshToken(null);
      setTokenExpiresAt(null);
      setUser(null);
      setStatus("unauthenticated");
      console.log("✅ Auth state cleared");
    } finally {
      isLoggingOut.current = false;
    }
  }, []);

  /**
   * Load stored authentication data on app start
   */
  const loadStoredAuth = useCallback(async () => {
    try {
      const {
        accessToken,
        refreshToken: storedRefreshToken,
        expiresAt,
      } = await SecureStorageService.getTokens();
      const userData = await SecureStorageService.getUser();

      if (
        accessToken &&
        userData &&
        userData.id &&
        userData.email &&
        userData.displayName
      ) {
        setToken(accessToken);
        setRefreshToken(storedRefreshToken);
        setTokenExpiresAt(expiresAt);
        setUser({
          id: userData.id as string,
          email: userData.email as string,
          displayName: userData.displayName as string,
        });

        // Check if token is expired or expiring soon
        if (isTokenExpired(expiresAt)) {
          console.log("⏰ Token is expired, refreshing...");
          // Don't set status to authenticated yet, try to refresh first
          if (refreshTokensRef.current) {
            await refreshTokensRef.current();
          }
        } else if (isTokenExpiringSoon(expiresAt)) {
          console.log("⏰ Token expiring soon, refreshing proactively...");
          setStatus("authenticated"); // Set authenticated first so app works
          // Refresh in background
          if (refreshTokensRef.current) {
            void refreshTokensRef.current();
          }
        } else {
          setStatus("authenticated");
          console.log("✅ Loaded stored authentication data");
        }
      } else {
        console.warn("⚠️ Incomplete stored auth data, clearing");
        await SecureStorageService.clearTokens();
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("❌ Failed to load stored auth data:", error);
      setToken(null);
      setRefreshToken(null);
      setTokenExpiresAt(null);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [isTokenExpired, isTokenExpiringSoon]);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const userData = await SecureStorageService.getUser();
      if (userData && userData.id && userData.email && userData.displayName) {
        setUser({
          id: userData.id as string,
          email: userData.email as string,
          displayName: userData.displayName as string,
        });
      }
    } catch (error) {
      console.error("❌ Failed to refresh user data:", error);
    }
  }, []);

  /**
   * Refresh access tokens
   */
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const { refreshToken: currentRefreshToken } =
        await SecureStorageService.getTokens();

      if (!currentRefreshToken) {
        throw new Error("No refresh token available");
      }

      const userAgent = navigator.userAgent || "PalPalette-App";

      // Create timeout promise (8 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Token refresh request timeout")),
          8000
        );
      });

      // Race between API call and timeout
      const response = (await Promise.race([
        AuthenticationService.authControllerRefresh(userAgent, {
          refresh_token: currentRefreshToken,
        }),
        timeoutPromise,
      ])) as Awaited<
        ReturnType<typeof AuthenticationService.authControllerRefresh>
      >;

      // Store new tokens with expiry
      await SecureStorageService.storeTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in
      );
      await SecureStorageService.storeUser(response.user);

      const newExpiresAt = response.expires_in
        ? Date.now() + response.expires_in * 1000
        : null;

      setToken(response.access_token);
      setRefreshToken(response.refresh_token);
      setTokenExpiresAt(newExpiresAt);
      setUser({
        id: response.user.id!,
        email: response.user.email!,
        displayName: response.user.displayName!,
      });
      setStatus("authenticated");

      console.log("✅ Tokens refreshed successfully");
      return true;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      // Clear all auth data on refresh failure - redirect to login
      await clearAuthState();
      return false;
    }
  }, [clearAuthState]);

  // Store refreshTokens in ref for use in loadStoredAuth and lifecycle handlers
  useEffect(() => {
    refreshTokensRef.current = refreshTokens;
  }, [refreshTokens]);

  /**
   * Login with email and password
   */
  const login = async (
    email: string,
    password: string,
    deviceName?: string
  ): Promise<boolean> => {
    try {
      const userAgent = navigator.userAgent || "PalPalette-App";
      const loginData = {
        email,
        password,
        device_name: deviceName || "Mobile App",
      };

      const response = await AuthenticationService.authControllerLogin(
        userAgent,
        loginData
      );

      // Store tokens and user data with expiry
      await SecureStorageService.storeTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in
      );
      await SecureStorageService.storeUser(response.user);

      const userData = response.user;
      if (userData.id && userData.email && userData.displayName) {
        const expiresAt = response.expires_in
          ? Date.now() + response.expires_in * 1000
          : null;

        setToken(response.access_token);
        setRefreshToken(response.refresh_token);
        setTokenExpiresAt(expiresAt);
        setUser({
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
        });
        setStatus("authenticated");
        console.log("✅ Login successful");

        // Register push token in the background (non-blocking)
        try {
          PushService.init();
          void PushService.syncRegistration();
        } catch (e) {
          console.warn("Push registration skipped:", e);
        }
        return true;
      } else {
        console.error("❌ Incomplete user data received from server");
        setStatus("unauthenticated");
        return false;
      }
    } catch (error) {
      console.error("❌ Login failed:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      setStatus("unauthenticated");
      return false;
    }
  };

  /**
   * Register new user
   */
  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<boolean> => {
    try {
      const { AuthenticationService } = await import(
        "../services/openapi/services/AuthenticationService"
      );
      const registerDto = { email, password, displayName };

      // Get user agent for device tracking
      const userAgent = navigator.userAgent || "PalPalette-App";

      const data = await AuthenticationService.authControllerRegister(
        userAgent,
        registerDto
      );

      // Now registration returns the same structure as login
      const { access_token, refresh_token, user: userData, expires_in } = data;

      if (userData && userData.id && userData.email && userData.displayName) {
        await SecureStorageService.storeTokens(
          access_token,
          refresh_token,
          expires_in
        );

        // Map the API response to our User interface
        const user: User = {
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
        };

        const expiresAt = expires_in ? Date.now() + expires_in * 1000 : null;

        await SecureStorageService.storeUser(
          user as unknown as Record<string, unknown>
        );
        setToken(access_token);
        setRefreshToken(refresh_token);
        setTokenExpiresAt(expiresAt);
        setUser(user);
        setStatus("authenticated");
        console.log("✅ Registration successful");

        // After auto-login on registration, also register push token
        try {
          PushService.init();
          void PushService.syncRegistration();
        } catch (e) {
          console.warn("Push registration (post-register) skipped:", e);
        }
        return true;
      } else {
        console.error("❌ Registration response incomplete");
        setStatus("unauthenticated");
        return false;
      }
    } catch (error) {
      console.error("❌ Registration failed:", error);
      setStatus("unauthenticated");
      return false;
    }
  };

  /**
   * Logout user - idempotent operation
   */
  const logout = async (): Promise<void> => {
    try {
      // Try to call logout endpoint if we have a token
      const { accessToken } = await SecureStorageService.getTokens();

      // Best-effort: attempt to unregister push token before clearing auth
      try {
        const pushToken = await SecureStorageService.getItem("push_token");
        if (pushToken) {
          void PushNotificationsService.pushControllerUnregisterToken({
            token: pushToken,
          });
        }
      } catch (e) {
        console.warn("Push token unregister skipped:", e);
      }

      if (accessToken) {
        try {
          await AuthenticationService.authControllerLogout();
        } catch (error) {
          console.warn("Logout request failed:", error);
        }
      }

      // Always clear local data
      await clearAuthState();
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Even if logout fails, clear local state
      await clearAuthState();
    }
  };

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  // Register the refresh function with HTTP interceptor
  useEffect(() => {
    setAuthRefreshFunction(refreshTokens);
  }, [refreshTokens]);

  // When auth state becomes valid (e.g., app relaunch), ensure push is registered
  useEffect(() => {
    if (user && token && status === "authenticated") {
      try {
        PushService.init();
        void PushService.syncRegistration();
      } catch (e) {
        console.warn("Push registration (auth effect) skipped:", e);
      }
    }
  }, [user, token, status]);

  // App lifecycle: validate token when app resumes from background
  useEffect(() => {
    const appStateListener = App.addListener(
      "appStateChange",
      async ({ isActive }) => {
        if (isActive && status === "authenticated") {
          console.log("📱 App resumed, checking token validity...");

          const { expiresAt } = await SecureStorageService.getTokens();

          if (isTokenExpired(expiresAt)) {
            console.log(
              "⏰ Token expired while app was backgrounded, refreshing..."
            );
            if (refreshTokensRef.current) {
              await refreshTokensRef.current();
            }
          } else if (isTokenExpiringSoon(expiresAt)) {
            console.log("⏰ Token expiring soon, refreshing proactively...");
            if (refreshTokensRef.current) {
              void refreshTokensRef.current();
            }
          } else {
            console.log("✅ Token still valid");
          }
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      appStateListener.then((listener) => listener.remove());
    };
  }, [status, isTokenExpired, isTokenExpiringSoon]);

  const value: AuthContextType = {
    status,
    user,
    token,
    refreshToken,
    login,
    register,
    logout,
    refreshUser,
    refreshTokens,
    isAuthenticated: status === "authenticated",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
