// Core services (keep these as they're not API-related)
export { CameraService } from "./CameraService";
export { ColorExtractionService } from "./ColorExtractionService";
export { LightingSystemService } from "./LightingSystemService";

// Logger service
export {
  logger,
  authLogger,
  deviceLogger,
  apiLogger,
  lightingLogger,
  LogLevel,
} from "./LoggerService";

// API configuration - simple OpenAPI setup
export { setupServices } from "./setupServices";

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
