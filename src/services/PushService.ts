import { Capacitor } from "@capacitor/core";
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from "@capacitor/push-notifications";
import { Device } from "@capacitor/device";
import { PushNotificationsService } from "./openapi";
import { RegisterPushTokenDto } from "./openapi/models/RegisterPushTokenDto";
import { SecureStorageService } from "./secure-storage.service";

/**
 * Centralized Push Notification handling
 * - Requests permission and registers with APNS/FCM
 * - Persists token locally
 * - Syncs token with backend using OpenAPI service
 */
export class PushService {
  private static initialized = false;
  private static readonly STORAGE_KEY = "push_token";

  static getPlatform(): RegisterPushTokenDto.platform {
    const platform = Capacitor.getPlatform();
    if (platform === "ios") return RegisterPushTokenDto.platform.IOS;
    if (platform === "android") return RegisterPushTokenDto.platform.ANDROID;
    return RegisterPushTokenDto.platform.WEB;
  }

  static async getStoredToken(): Promise<string | null> {
    return SecureStorageService.getItem(this.STORAGE_KEY);
  }

  private static async setStoredToken(token: string | null): Promise<void> {
    if (token) {
      await SecureStorageService.setItem(this.STORAGE_KEY, token);
    } else {
      await SecureStorageService.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Initialize global listeners once. Safe to call multiple times.
   */
  static init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Listen for successful registration
    PushNotifications.addListener("registration", async (token: Token) => {
      console.log("📲 Push registration token:", token.value);
      await this.setStoredToken(token.value);
      // Try to sync with backend when we have a token
      this.syncRegistration().catch((e) =>
        console.warn("Push sync failed:", e)
      );
    });

    // Listen for registration errors
    PushNotifications.addListener("registrationError", (error: unknown) => {
      console.error("❌ Push registration error:", error);
    });

    // Foreground notifications
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        console.log("🔔 Push notification received in foreground:");
        console.log("  - ID:", notification.id);
        console.log("  - Title:", notification.title);
        console.log("  - Body:", notification.body);
        console.log("  - Data:", notification.data);

        // TODO: Show toast notification or update UI based on notification type
      }
    );

    // Action taps (when user taps on notification)
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        console.log("👉 Push notification tapped:");
        console.log("  - Action ID:", action.actionId);
        console.log("  - Notification:", action.notification);
        console.log("  - Data:", action.notification.data);

        // TODO: navigate based on action.notification.data
        // Example: if (action.notification.data?.route) { /* navigate */ }
      }
    );
  }

  /**
   * Request permission and register with APNS/FCM. Resolves with token or null.
   */
  static async register(): Promise<string | null> {
    try {
      const permStatus = await PushNotifications.checkPermissions();
      let receive = permStatus.receive;

      if (receive === "prompt") {
        const request = await PushNotifications.requestPermissions();
        receive = request.receive;
      }

      if (receive !== "granted") {
        console.warn("⚠️ Push permission not granted");
        return null;
      }

      // Register - token will be delivered via 'registration' event
      await PushNotifications.register();

      // Wait briefly for the registration event to populate storage
      const token = await this.waitForToken(4000);
      return token;
    } catch (e) {
      console.error("❌ Failed to register for push notifications:", e);
      return null;
    }
  }

  private static async waitForToken(timeoutMs: number): Promise<string | null> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const tok = await this.getStoredToken();
      if (tok) return tok;
      await new Promise((r) => setTimeout(r, 100));
    }
    return await this.getStoredToken();
  }

  /**
   * Sync the locally available token to backend. If no token, attempts registration.
   * Does nothing on web if an FCM token cannot be obtained.
   */
  static async syncRegistration(): Promise<void> {
    try {
      const platform = this.getPlatform();

      let token = await this.getStoredToken();
      if (!token) {
        token = await this.register();
      }

      if (!token) {
        if (platform === RegisterPushTokenDto.platform.WEB) {
          console.info("ℹ️ No FCM token on web; skipping backend registration");
        } else {
          console.warn("⚠️ No push token available; registration skipped");
        }
        return;
      }

      const deviceId = (await Device.getId()).identifier;

      await PushNotificationsService.pushControllerRegisterToken({
        token,
        platform,
        deviceId,
      });
      console.log("✅ Push token registered with backend");
    } catch (e) {
      console.error("❌ Failed to sync push registration:", e);
      // Do not throw; keep app flow unaffected
    }
  }

  /**
   * Unregister the current token from backend (best-effort). Does not clear local token by default.
   */
  static async unregister(options?: {
    clearLocal?: boolean;
    tokenOverride?: string;
  }): Promise<void> {
    try {
      const token = options?.tokenOverride || (await this.getStoredToken());
      if (!token) return;

      await PushNotificationsService.pushControllerUnregisterToken({ token });
      console.log("🧹 Push token unregistered on backend");

      if (options?.clearLocal) {
        await this.setStoredToken(null);
      }
    } catch (e) {
      console.warn("⚠️ Failed to unregister push token:", e);
    }
  }
}
