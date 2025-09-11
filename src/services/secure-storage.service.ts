import { Preferences } from "@capacitor/preferences";

/**
 * Secure storage service using Capacitor Preferences
 * Provides secure storage for sensitive data like tokens
 */
export class SecureStorageService {
  /**
   * Store a value securely
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error(`Failed to store ${key} securely:`, error);
      // Fallback to localStorage for web development
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
      }
      throw error;
    }
  }

  /**
   * Get a value from secure storage
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      console.error(`Failed to retrieve ${key} from secure storage:`, error);
      // Fallback to localStorage for web development
      if (typeof window !== "undefined") {
        return localStorage.getItem(key);
      }
      return null;
    }
  }

  /**
   * Remove a value from secure storage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`Failed to remove ${key} from secure storage:`, error);
      // Fallback to localStorage for web development
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
      throw error;
    }
  }

  /**
   * Clear all stored values
   */
  static async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error("Failed to clear secure storage:", error);
      // Fallback to localStorage for web development
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      throw error;
    }
  }

  /**
   * Store authentication tokens securely
   */
  static async storeTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    try {
      await Promise.all([
        this.setItem("access_token", accessToken),
        this.setItem("refresh_token", refreshToken),
      ]);
    } catch (error) {
      console.error("Failed to store tokens securely:", error);
      throw error;
    }
  }

  /**
   * Get stored authentication tokens
   */
  static async getTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.getItem("access_token"),
        this.getItem("refresh_token"),
      ]);
      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Failed to retrieve tokens from secure storage:", error);
      return { accessToken: null, refreshToken: null };
    }
  }

  /**
   * Clear stored authentication tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        this.removeItem("access_token"),
        this.removeItem("refresh_token"),
        this.removeItem("user"),
        // Clear legacy tokens too
        this.removeItem("auth_token"),
        this.removeItem("auth_user"),
      ]);
    } catch (error) {
      console.error("Failed to clear tokens from secure storage:", error);
      throw error;
    }
  }

  /**
   * Store user data securely
   */
  static async storeUser(user: Record<string, unknown>): Promise<void> {
    try {
      await this.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Failed to store user data securely:", error);
      throw error;
    }
  }

  /**
   * Get stored user data
   */
  static async getUser(): Promise<Record<string, unknown> | null> {
    try {
      const userStr = await this.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Failed to retrieve user data from secure storage:", error);
      return null;
    }
  }
}
