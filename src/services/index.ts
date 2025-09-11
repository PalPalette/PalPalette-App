// Core services (keep these as they're not API-related)
export { CameraService } from "./CameraService";
export { ColorExtractionService } from "./ColorExtractionService";
export { WebSocketService } from "./WebSocketService";
export { LightingSystemService } from "./LightingSystemService";

// Notification service
export {
  UserNotificationService,
  userNotificationService,
} from "./UserNotificationService";

// API configuration - enhanced client with session management
export {
  enhancedApiClient,
  configureApiClient,
  setApiToken,
  clearApiToken,
  getApiToken,
} from "./enhanced-api-client";

// Legacy API configuration (for backward compatibility)
export {
  configureApiClient as configureApiClientLegacy,
  setApiToken as setApiTokenLegacy,
  clearApiToken as clearApiTokenLegacy,
  getApiToken as getApiTokenLegacy,
} from "./api-config";

// Generated OpenAPI services - use these directly!
export {
  AuthenticationService,
  UsersService,
  DevicesService,
  MessagesService,
} from "./openapi";

// All generated types and models
export * from "./openapi";

// Type exports
export type { CameraPhoto } from "./CameraService";
export type { ExtractedColor, ColorPalette } from "./ColorExtractionService";
export type {
  UserNotification,
  NotificationAction,
  DeviceAuthenticationState,
} from "./UserNotificationService";

// Enhanced API client types
export type {
  LoginCredentials,
  AuthTokens,
  UserData,
  Session,
} from "./enhanced-api-client";

// Re-export common generated types for convenience
export type {
  LoginRequestDto,
  RegisterUserDto,
  Device,
  User,
  Message,
  CreateColorPaletteDto,
  SendPaletteToFriendsDto,
  ClaimByCodeDto,
} from "./openapi";
