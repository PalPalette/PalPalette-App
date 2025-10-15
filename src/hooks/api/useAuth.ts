import { useState, useCallback, useEffect } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: string;
    displayName: string;
    email?: string;
  } | null;
}

export interface UseAuthReturn extends AuthState {
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          token,
          user,
        });
      } catch (err) {
        console.error("Failed to parse stored user data:", err);
        // Clear invalid data
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Use generated AuthenticationService
        const { AuthenticationService } = await import(
          "../../services/openapi/services/AuthenticationService"
        );

        // Note: username is actually email in our system
        const loginData = { email: username, password };
        const response = await AuthenticationService.authControllerLogin(
          navigator.userAgent || "PalPalette-Web-Client",
          loginData
        );

        const { access_token, user: userData } = response;

        if (access_token && userData?.id && userData?.displayName) {
          const user = {
            id: userData.id,
            displayName: userData.displayName,
            email: userData.email,
          };

          localStorage.setItem(AUTH_TOKEN_KEY, access_token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          setAuthState({
            isAuthenticated: true,
            token: access_token,
            user,
          });
          return true;
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        console.error("Login error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Use generated AuthenticationService
        const { AuthenticationService } = await import(
          "../../services/openapi/services/AuthenticationService"
        );

        // displayName is username for DTO
        const registerDto = { email, password, displayName: username };
        const response = await AuthenticationService.authControllerRegister(
          navigator.userAgent || "PalPalette-App",
          registerDto
        );

        const { access_token, user: userData } = response;

        if (access_token && userData?.id && userData?.displayName) {
          const user = {
            id: userData.id,
            displayName: userData.displayName,
            email: userData.email,
          };

          localStorage.setItem(AUTH_TOKEN_KEY, access_token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          setAuthState({
            isAuthenticated: true,
            token: access_token,
            user,
          });
          return true;
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Registration failed";
        setError(errorMessage);
        console.error("Registration error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    // Clear state
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    setError(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!authState.token) return false;

    setLoading(true);
    setError(null);

    try {
      // Use the enhanced API client for token refresh
      const { enhancedApiClient } = await import(
        "../../services/enhanced-api-client"
      );
      const newToken = await enhancedApiClient.refreshAccessToken();
      const userData = await enhancedApiClient.getUser();

      if (newToken && userData?.id && userData?.displayName) {
        const user = {
          id: userData.id,
          displayName: userData.displayName,
          email: userData.email,
        };

        // Update stored token
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

        // Update state
        setAuthState({
          isAuthenticated: true,
          token: newToken,
          user,
        });

        return true;
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Token refresh failed";
      setError(errorMessage);
      console.error("Token refresh error:", err);

      // On refresh failure, logout the user
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [authState.token, logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ...authState,
    loading,
    error,
    login,
    logout,
    register,
    refreshToken,
    clearError,
  };
};
