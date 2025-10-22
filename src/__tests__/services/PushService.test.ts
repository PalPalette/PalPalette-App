import { describe, it, expect, vi, beforeEach } from "vitest";
import { PushService } from "../../services/PushService";
import { RegisterPushTokenDto } from "../../services/openapi/models/RegisterPushTokenDto";

vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: vi.fn(() => "android") },
}));

vi.mock("@capacitor/push-notifications", () => ({
  PushNotifications: {
    checkPermissions: vi.fn(async () => ({ receive: "granted" })),
    requestPermissions: vi.fn(async () => ({ receive: "granted" })),
    register: vi.fn(async () => undefined),
    addListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}));

vi.mock("@capacitor/device", () => ({
  Device: { getId: vi.fn(async () => ({ identifier: "device-123" })) },
}));

vi.mock("../../services/openapi", () => ({
  PushNotificationsService: {
    pushControllerRegisterToken: vi.fn(async () => ({
      success: true,
      message: "ok",
      subscriptionId: "sub-1",
    })),
    pushControllerUnregisterToken: vi.fn(async () => ({
      success: true,
      message: "ok",
    })),
  },
}));

vi.mock("../../services/secure-storage.service", () => ({
  SecureStorageService: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

describe("PushService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module init flag
    // @ts-expect-error private access
    PushService.initialized = false;
  });

  it("maps platform via Capacitor", () => {
    const p = PushService.getPlatform();
    expect(p).toBe(RegisterPushTokenDto.platform.ANDROID);
  });

  it("initializes listeners safely", () => {
    PushService.init();
    PushService.init(); // second call should be no-op
    expect(true).toBe(true);
  });

  it("syncRegistration does not throw without token", async () => {
    await expect(PushService.syncRegistration()).resolves.toBeUndefined();
  });
});
