import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { AuthenticationService } from "../services/openapi";
import { SecureStorageService } from "../services/secure-storage.service";

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthContextType {
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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load stored authentication data on app start
   */
  const loadStoredAuth = useCallback(async () => {
    try {
      setLoading(true);
      const { accessToken, refreshToken } =
        await SecureStorageService.getTokens();
      const userData = await SecureStorageService.getUser();

      if (
        accessToken &&
        userData &&
        userData.id &&
        userData.email &&
        userData.displayName
      ) {
        setToken(accessToken);
        setRefreshToken(refreshToken);
        setUser({
          id: userData.id as string,
          email: userData.email as string,
          displayName: userData.displayName as string,
        });
        console.log("✅ Loaded stored authentication data");
      } else {
        console.warn("⚠️ Incomplete stored auth data, clearing");
        await SecureStorageService.clearTokens();
      }
    } catch (error) {
      console.error("❌ Failed to load stored auth data:", error);
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
   * Refresh access tokens - now handled automatically by HTTP interceptor
   */
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const { refreshToken: currentRefreshToken } =
        await SecureStorageService.getTokens();

      if (!currentRefreshToken) {
        throw new Error("No refresh token available");
      }

      const userAgent = navigator.userAgent || "PalPalette-App";
      const response = await AuthenticationService.authControllerRefresh(
        userAgent,
        { refresh_token: currentRefreshToken }
      );

      // Store new tokens
      await SecureStorageService.storeTokens(
        response.access_token,
        response.refresh_token
      );
      await SecureStorageService.storeUser(response.user);

      setToken(response.access_token);
      setRefreshToken(response.refresh_token);

      console.log("✅ Tokens refreshed successfully");
      return true;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      // Clear all auth data on refresh failure
      await logout();
      return false;
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = async (
    email: string,
    password: string,
    deviceName?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

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

      // Store tokens and user data
      await SecureStorageService.storeTokens(
        response.access_token,
        response.refresh_token
      );
      await SecureStorageService.storeUser(response.user);

      const userData = response.user;
      if (userData.id && userData.email && userData.displayName) {
        setToken(response.access_token);
        setRefreshToken(response.refresh_token);
        setUser({
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
        });
        console.log("✅ Login successful");
        return true;
      } else {
        console.error("❌ Incomplete user data received from server");
        return false;
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      return false;
    } finally {
      setLoading(false);
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
      setLoading(true);
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
      const { access_token, refresh_token, user: userData } = data;

      if (userData && userData.id && userData.email && userData.displayName) {
        await SecureStorageService.storeTokens(access_token, refresh_token);

        // Map the API response to our User interface
        const user: User = {
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
        };

        await SecureStorageService.storeUser(
          user as unknown as Record<string, unknown>
        );
        setToken(access_token);
        setRefreshToken(refresh_token);
        setUser(user);
        console.log("✅ Registration successful");
        return true;
      } else {
        console.error("❌ Registration response incomplete");
        return false;
      }
    } catch (error) {
      console.error("❌ Registration failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);

      // Try to call logout endpoint if we have a token
      const { accessToken } = await SecureStorageService.getTokens();
      if (accessToken) {
        try {
          await AuthenticationService.authControllerLogout();
        } catch (error) {
          console.warn("Logout request failed:", error);
        }
      }

      // Always clear local data
      await SecureStorageService.clearTokens();
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();

    // Set up session expired event listener for HTTP interceptor
    const handleSessionExpired = () => {
      console.log("🚪 Session expired automatically - logging out user");
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    };

    window.addEventListener("auth:sessionExpired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:sessionExpired", handleSessionExpired);
    };
  }, [loadStoredAuth]);

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    login,
    register,
    logout,
    refreshUser,
    refreshTokens,
    isAuthenticated: !!user && !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
