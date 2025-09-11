import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  enhancedApiClient,
  LoginCredentials,
} from "../services/enhanced-api-client";
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
      const userData = await enhancedApiClient.getUser();
      if (userData && userData.id && userData.email && userData.displayName) {
        setUser(userData);
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
      const newAccessToken = await enhancedApiClient.refreshAccessToken();
      const newRefreshToken = enhancedApiClient.getRefreshToken();

      setToken(newAccessToken);
      setRefreshToken(newRefreshToken);

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

      const credentials: LoginCredentials = {
        email,
        password,
        device_name: deviceName,
      };

      const response = await enhancedApiClient.login(credentials);

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
      const data = await AuthenticationService.authControllerRegister(
        registerDto
      );

      // Note: Registration endpoint might not return the same structure as login
      // We'll need to handle this based on the actual API response
      const { access_token, refresh_token, user: userData } = data;

      if (userData && userData.id && userData.email && userData.displayName) {
        await SecureStorageService.storeTokens(access_token, refresh_token);
        await SecureStorageService.storeUser(userData);
        setToken(access_token);
        setRefreshToken(refresh_token);
        setUser(userData);
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
      await enhancedApiClient.logout();
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

    // Set up session expired event listener
    const handleSessionExpired = () => {
      console.log("🚪 Session expired automatically - logging out user");
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    };

    window.addEventListener("auth:sessionExpired", handleSessionExpired);

    // Legacy callback for compatibility
    enhancedApiClient.setOnSessionExpiredCallback(handleSessionExpired);

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
