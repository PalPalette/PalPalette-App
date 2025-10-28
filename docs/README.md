# PalPalette Mobile App Documentation

## Overview

The PalPalette mobile app is a cross-platform application built with Ionic framework and React. It provides users with camera-based color extraction, ESP32/ESP8266 device management, advanced lighting system integration (Nanoleaf, generic RGB), and social color sharing features through real-time WebSocket connections.

**Current Version**: 1.0.0  
**Last Updated**: October 2025  
**Platforms**: iOS, Android  
**Backend Integration**: Full OpenAPI integration with type-safe client generation

## Platform Setup Guides

- 📱 **[iOS Setup Guide](./iOS-Setup-Guide.md)** - Complete guide for iOS configuration, push notifications, and deployment
- 📱 **[iOS Setup Checklist](./iOS-Setup-Checklist.md)** - Quick checklist for iOS setup
- 🤖 **Android Setup** - Already configured with Firebase (see `android/` folder)

## Architecture

### Technology Stack

- **Framework**: Ionic 8.5.0 with React 19.0.0
- **Build Tool**: Vite 7.1.5 (fast development and optimized builds)
- **Language**: TypeScript 5.1.6
- **Navigation**: React Router 5.3.4
- **State Management**: React Context API
- **Native Features**: Capacitor 7.4.2
- **UI Components**: Ionic React components
- **Camera**: Capacitor Camera plugin
- **HTTP**: Generated OpenAPI clients with automatic API integration
- **Real-time**: WebSocket service for live device status and notifications
- **Push Notifications**: Capacitor Push Notifications plugin
- **Color Processing**: ColorThief library for advanced color extraction

### Key Dependencies

#### Core Framework

- **@ionic/react**: 8.5.0 - Cross-platform UI components
- **@ionic/react-router**: 8.5.0 - Routing integration
- **react**: 19.0.0 - UI library
- **react-dom**: 19.0.0 - DOM rendering
- **react-router**: 5.3.4 - Client-side routing

#### Capacitor Plugins

- **@capacitor/core**: 7.4.2 - Native bridge
- **@capacitor/camera**: 7.0.1 - Camera and photo access
- **@capacitor/push-notifications**: 7.0.1 - Push notification support
- **@capacitor/preferences**: 7.0.1 - Secure storage
- **@capacitor/haptics**: 7.0.1 - Tactile feedback

#### Development Tools

- **vite**: 7.1.5 - Fast build tool and development server
- **typescript**: 5.1.6 - Type safety
- **vitest**: 3.2.4 - Unit testing framework
- **cypress**: 13.5.0 - E2E testing
- **eslint**: 9.20.1 - Code linting

#### API Integration

- **openapi-typescript-codegen**: 0.29.0 - API client generation
- **colorthief**: 2.6.0 - Color extraction algorithms
- **react-hook-form**: 7.61.1 - Form management
- **yup**: 1.7.0 - Schema validation

### Project Structure

```
src/
├── components/          # Reusable UI components (organized by domain)
│   ├── common/         # Generic reusable components (PhotoPicker, ColorPicker, etc.)
│   ├── devices/        # Device management components
│   ├── lighting/       # Lighting system components
│   ├── notifications/  # User notification components
│   ├── routing/        # Route protection components
│   └── layouts/        # App layout components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx      # Authentication state and user management
│   ├── DeviceContext.tsx    # Device management state
│   └── DeveloperModeContext.tsx # Developer mode toggle
├── hooks/              # Custom React hooks (organized by domain)
│   ├── api/            # API-related hooks (useDevices, useLighting, etc.)
│   ├── device/         # Device-specific hooks
│   ├── ui/             # UI-related hooks
│   ├── useAuth.ts      # Authentication hook
│   ├── useWebSocket.ts # WebSocket connection management
│   └── useWebSocketSingleton.ts # Singleton WebSocket instance
├── pages/              # Main application screens
│   ├── Login.tsx           # Authentication page
│   ├── Devices.tsx         # Device management page
│   ├── DeviceDiscovery.tsx # Device discovery and pairing
│   ├── PaletteCreator.tsx  # Color palette creation and sharing
│   ├── ColorPalette.tsx    # Manual color control
│   ├── Friends.tsx         # Friend management
│   ├── Messages.tsx        # Message history
│   └── Settings.tsx        # App settings and configuration
├── services/           # API and external service integrations
│   ├── openapi/        # Generated OpenAPI client (auto-generated)
│   ├── CameraService.ts           # Camera integration
│   ├── ColorExtractionService.ts  # Color palette extraction
│   ├── WebSocketService.ts        # Real-time communication
│   ├── LightingSystemService.ts   # Lighting control
│   ├── PushService.ts             # Push notifications
│   └── UserNotificationService.ts # User notification management
├── config/             # Configuration files
│   └── api.ts          # Environment-based API configuration
├── theme/              # Ionic theme customization
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

## Core Features

### 1. Authentication System

#### Login/Register Flow

- Email and password authentication
- JWT token storage in secure storage (Capacitor Preferences)
- Automatic token refresh with HTTP interceptors
- Secure token management

**Implementation**: `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
```

### 2. Device Management

#### Device Discovery and Claiming

- Real-time device discovery with WebSocket updates
- Claim devices using 6-digit pairing codes
- Device status monitoring (online/offline, battery level, WiFi strength)
- Device provisioning and setup workflow
- Device settings and configuration

**Implementation**: `src/contexts/DeviceContext.tsx` + `src/hooks/api/useDevices.ts`

```typescript
interface DeviceContextType {
  devices: Device[];
  loading: boolean;
  refreshDevices: () => Promise<void>;
  claimDeviceByCode: (pairingCode: string) => Promise<void>;
  resetDevice: (deviceId: string) => Promise<void>;
  updateDevice: (deviceId: string, data: UpdateDeviceData) => Promise<void>;
}
```

### 3. Lighting System Integration

#### Advanced Lighting Control

- Support for multiple lighting systems (Nanoleaf, generic RGB)
- Lighting system discovery and configuration
- Real-time lighting status updates via WebSocket
- Color palette synchronization to lighting devices
- Lighting effects and animations

**Implementation**: `src/hooks/api/useLighting.ts`

```typescript
interface UseLightingReturn {
  loading: boolean;
  error: string | null;
  configureLighting: (
    deviceId: string,
    config: LightingSystemConfigDto
  ) => Promise<boolean>;
  getLightingStatus: (deviceId: string) => Promise<LightingSystemStatus | null>;
  sendColorPalette: (deviceId: string, colors: string[]) => Promise<boolean>;
  testLighting: (deviceId: string) => Promise<boolean>;
}
```

### 4. Camera and Color Extraction

#### Advanced Color Palette Generation

- Camera integration for photo capture with Capacitor Camera
- Gallery access for existing photos
- Advanced color extraction using ColorThief algorithm
- Dominant color detection and palette optimization
- Manual color picker for custom palettes
- Drag-and-drop color arrangement

**Implementation**: `src/services/ColorExtractionService.ts`

```typescript
interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  name?: string;
}

interface ColorPalette {
  colors: ExtractedColor[];
  dominantColor: ExtractedColor;
  source: "camera" | "gallery";
  imageUrl?: string;
}
```

#### Key Components

- `PhotoPicker` - Camera/gallery integration
- `ColorPicker` - Manual color selection
- `PaletteCreator` - Main palette creation interface

### 5. Real-time Communication

#### WebSocket Integration

- Real-time device status updates
- Live lighting system status monitoring
- User notifications for device interactions
- Connection state management with automatic reconnection

**Implementation**: `src/hooks/useWebSocket.ts`

```typescript
interface WebSocketHookReturn {
  isConnected: boolean;
  userNotifications: UserNotificationDto[];
  deviceStatuses: Map<string, DeviceStatusEvent>;
  lightingStatuses: Map<string, LightingSystemStatusEvent>;
  connect: () => void;
  disconnect: () => void;
}
```

### 6. Social Features

#### Color Sharing and Friends

- Friend management system
- Send color palettes to friends
- Message history and status tracking
- Real-time delivery notifications via WebSocket
- Push notifications for color sharing

**Key Features**:

- Friend requests and management
- Palette sharing with image attachments
- Message status tracking (sent, delivered, read)
- Cross-device color synchronization

### 7. Push Notifications

#### Native Push Support

- Firebase Cloud Messaging integration (Android)
- Apple Push Notification Service (iOS)
- Real-time notifications for color sharing
- Background notification handling

**Implementation**: `src/services/PushService.ts`

## User Interface

### Design System

- **Theme**: Ionic default theme with custom color palette
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8px grid system
- **Colors**: Brand colors matching PalPalette theme
- **Icons**: Ionic icons with custom device icons

### Key Screens

#### 1. Authentication Screens

- **Login Page** (`src/pages/auth/Login.tsx`)

  - Email/password form
  - Login validation
  - Navigation to register
  - "Remember me" option

- **Register Page** (`src/pages/auth/Register.tsx`)
  - User registration form
  - Email/username validation
  - Password strength indicator
  - Terms of service agreement

#### 2. Device Management Screens

- **Devices Page** (`src/pages/devices/Devices.tsx`)

  - Device list with status indicators
  - Add device button
  - Device quick actions
  - Search and filter options

- **Device Detail Page** (`src/pages/devices/DeviceDetail.tsx`)
  - Device information and settings
  - Connection status
  - Recent color history
  - Device actions (rename, reset, remove)

#### 3. Color Creation Screens

- **PaletteCreator Page** (`src/pages/PaletteCreator.tsx`)

  - Photo-based color extraction
  - Manual color picker interface
  - Drag-and-drop color arrangement
  - Friend selector for sharing
  - Real-time palette preview

- **ColorPalette Page** (`src/pages/ColorPalette.tsx`)
  - Manual RGB color control
  - Preset color buttons
  - Direct device control
  - Real-time color preview

#### 4. Social Screens

- **Friends Page** (`src/pages/Friends.tsx`)

  - Friend list management
  - Friend request handling
  - Search and add friends
  - Friend status indicators

- **Messages Page** (`src/pages/Messages.tsx`)
  - Message history with color previews
  - Sent/received filter
  - Message status indicators
  - Search and filter functionality

### Modal Components

#### PairingCodeModal

```typescript
interface PairingCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
}
```

- 6-digit code input with auto-formatting
- Code validation and error handling
- Loading states during claim process
- Success/error feedback

#### SetupWizardModal

```typescript
interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  device?: Device;
}
```

- Step-by-step device setup guide
- WiFi connection instructions
- Pairing code entry
- Setup completion confirmation

## State Management

### React Context Architecture

#### AuthContext

Manages user authentication state and provides authentication methods.

```typescript
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    // Login implementation with API call
    // Store JWT token securely
    // Update user state
  }, []);

  // Other authentication methods...
};
```

#### DeviceContext

Manages device state and provides device management methods.

```typescript
const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshDevices = useCallback(async () => {
    // Fetch devices from API
    // Update devices state
  }, []);

  // Other device methods...
};
```

### Performance Optimizations

- `useCallback` hooks for stable function references
- `useMemo` for expensive calculations
- Proper dependency arrays to prevent infinite loops
- Optimized re-rendering with React.memo

## API Integration

### OpenAPI Integration

The app uses automatically generated API clients from OpenAPI specifications for type-safe API communication.

```typescript
// src/services/setupServices.ts
import { OpenAPI } from "./openapi";

export const setupServices = () => {
  // Configure base URL from environment
  OpenAPI.BASE = API_CONFIG.BASE_URL;

  // Set up automatic token injection
  OpenAPI.TOKEN = async () => {
    const token = await secureStorageService.getItem("authToken");
    return token || "";
  };
};
```

### Generated Service Classes

The following services are automatically generated from the OpenAPI specification:

#### DevicesService

```typescript
// Auto-generated from OpenAPI spec
export class DevicesService {
  static async devicesControllerGetMyDevices(): Promise<Device[]>;
  static async devicesControllerClaimByCode(
    requestBody: ClaimByCodeDto
  ): Promise<Device>;
  static async devicesControllerUpdateDevice(
    deviceId: string,
    requestBody: UpdateDeviceDto
  ): Promise<Device>;
  static async devicesControllerGetLightingSystemStatus(
    deviceId: string
  ): Promise<LightingSystemStatus>;
  // ... many more methods
}
```

#### AuthenticationService

```typescript
// Auto-generated from OpenAPI spec
export class AuthenticationService {
  static async authControllerLogin(
    requestBody: LoginRequestDto
  ): Promise<AuthResponseDto>;
  static async authControllerRegister(
    requestBody: RegisterUserDto
  ): Promise<AuthResponseDto>;
  static async authControllerRefreshToken(): Promise<AuthResponseDto>;
}
```

### HTTP Interceptor

Automatic token refresh and error handling:

```typescript
// src/services/http-interceptor.service.ts
export const httpInterceptor = (() => {
  // Intercept OpenAPI requests for automatic token refresh
  const originalFetch = window.fetch;

  window.fetch = async (input, init) => {
    try {
      const response = await originalFetch(input, init);

      if (response.status === 401) {
        // Handle token refresh automatically
        await refreshTokenIfNeeded();
        // Retry original request
      }

      return response;
    } catch (error) {
      // Global error handling
      throw error;
    }
  };
})();
```

## Native Features

### Capacitor Plugins

#### Camera Plugin

```typescript
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const capturePhoto = async (): Promise<string> => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
  });

  return image.webPath!;
};
```

#### Storage Plugin

```typescript
import { Storage } from "@capacitor/storage";

const setStorageItem = async (key: string, value: string): Promise<void> => {
  await Storage.set({ key, value });
};

const getStorageItem = async (key: string): Promise<string | null> => {
  const result = await Storage.get({ key });
  return result.value;
};
```

### Platform-Specific Features

#### Android

- Material Design components
- Android-specific navigation patterns
- Hardware back button handling
- Deep linking support

#### iOS

- iOS design guidelines compliance
- Native navigation transitions
- iOS-specific gesture handling
- App Store submission requirements

## Development

### Getting Started

```bash
# Install dependencies
npm install

# Start development server (Vite)
npm run dev

# Alternative Ionic development server
npm run ionic:serve

# Generate OpenAPI client (when backend is updated)
npm run api:update

# Run on Android
npm run cap:add:android     # First time only
npm run cap:run:android     # Production build + run
npm run cap:run:android:dev # Development build + run

# Run on iOS (macOS only)
npm run cap:add:ios     # First time only
npm run cap:run:ios     # Production build + run
npm run cap:run:ios:dev # Development build + run
```

### Development Tools

#### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run dev:prod         # Start dev server in production mode

# Building
npm run build            # Production build
npm run build:dev        # Development build
npm run build:mobile     # Build and sync to mobile platforms

# Mobile Development
npm run cap:sync         # Sync web assets to native platforms
npm run cap:open:android # Open Android Studio
npm run cap:open:ios     # Open Xcode

# API Integration
npm run api:generate     # Generate OpenAPI client
npm run api:clean        # Clean generated API code
npm run api:update       # Clean and regenerate API client

# Testing
npm run test.unit        # Run Vitest unit tests
npm run test.e2e         # Run Cypress E2E tests
npm run lint             # Run ESLint
```

#### Debugging

```bash
# Browser DevTools
npx ionic serve

# Remote debugging for Android
chrome://inspect/#devices

# Safari Web Inspector for iOS
```

### Testing

#### Unit Testing (Vitest)

```bash
# Run unit tests
npm run test.unit

# Run tests in watch mode
vitest --watch

# Generate coverage report
vitest run --coverage
```

#### E2E Testing (Cypress)

```bash
# Run Cypress E2E tests
npm run test.e2e

# Open Cypress Test Runner
npx cypress open
```

## Build and Deployment

### Production Build

```bash
# Build for production (Vite optimized)
npm run build

# Build and sync to native platforms
npm run build:mobile

# Build for specific environments
npm run build:dev  # Development build
npm run build:prod # Production build
```

### Android Deployment

```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Upload to Google Play Console
# Follow Google Play publishing guidelines
```

### iOS Deployment

```bash
# Open in Xcode
npx ionic cap open ios

# Archive and upload to App Store Connect
# Follow Apple App Store guidelines
```

## Configuration

### Environment Configuration

Environment configuration is handled through Vite's environment system and adaptively detects the runtime environment:

```typescript
// src/config/api.ts
const getEnvironmentConfig = () => {
  // Check if we're in a Vite environment (development/build)
  const isVite = typeof import.meta !== "undefined" && import.meta.env;

  if (isVite) {
    // Vite environment - use import.meta.env
    return {
      BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
      WEBSOCKET_URL:
        import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:3001",
      ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "development",
      DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === "true",
    };
  } else {
    // Capacitor/native environment - use development server
    return {
      BASE_URL: "http://192.168.178.66:3000", // Local network IP for mobile development
      WEBSOCKET_URL: "http://192.168.178.66:3001",
      ENVIRONMENT: "mobile-dev",
      DEBUG_MODE: true,
    };
  }
};

export const API_CONFIG = getEnvironmentConfig();
```

### Environment Variables

Create a `.env` file in the project root for local development:

```bash
# .env
VITE_BACKEND_URL=http://localhost:3000
VITE_WEBSOCKET_URL=http://localhost:3001
VITE_ENVIRONMENT=development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Capacitor Configuration

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.palpalette.app",
  appName: "PalPalette",
  webDir: "dist", // Vite build output directory
  server: {
    androidScheme: "https",
  },
  plugins: {
    Camera: {
      permissions: ["camera", "photos"],
    },
    Preferences: {
      group: "palpalette", // Secure storage group
    },
    Haptics: {}, // Tactile feedback
    StatusBar: {
      style: "dark",
      backgroundColor: "#ffffff",
    },
    Keyboard: {
      resize: "body",
      style: "dark",
    },
    App: {
      windowsPathPrefix: "ms-appx-web",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  ios: {
    scheme: "PalPalette",
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true, // For development
  },
};

export default config;
```

## Performance Optimization

### Image Optimization

```typescript
const optimizeImage = (
  imageUrl: string,
  maxSize: number = 300
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };

    img.src = imageUrl;
  });
};
```

### Memory Management

```typescript
// Cleanup event listeners and timeouts
useEffect(() => {
  const cleanup = () => {
    // Remove event listeners
    // Clear timeouts/intervals
    // Cancel pending requests
  };

  return cleanup;
}, []);
```

## Security

### Secure Storage

```typescript
// Store sensitive data securely
const storeSecureData = async (key: string, value: string): Promise<void> => {
  await Storage.set({
    key,
    value: btoa(value), // Basic encoding, use proper encryption in production
  });
};
```

### Input Validation

```typescript
// Validate user inputs
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePairingCode = (code: string): boolean => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};
```

## Troubleshooting

### Common Issues

#### Camera Permissions

```typescript
// Request camera permissions
const requestCameraPermission = async (): Promise<boolean> => {
  const permission = await Camera.checkPermissions();

  if (permission.camera !== "granted") {
    const request = await Camera.requestPermissions({
      permissions: ["camera"],
    });
    return request.camera === "granted";
  }

  return true;
};
```

#### Network Connectivity

```typescript
// Check network status
import { Network } from "@capacitor/network";

const checkNetworkStatus = async (): Promise<boolean> => {
  const status = await Network.getStatus();
  return status.connected;
};
```

#### Build Issues

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clean and rebuild (Windows)
rmdir /s /q node_modules
del package-lock.json
npm install
npm run build

# Clean and rebuild (Unix/Mac)
rm -rf node_modules package-lock.json
npm install
npm run build

# Clear Capacitor cache
npx cap sync --force
```

## Current Features Status

### ✅ Implemented Features

- **Authentication**: JWT-based login/register with automatic token refresh
- **Device Management**: Real-time device discovery, claiming, and status monitoring
- **Lighting Systems**: Nanoleaf and generic RGB lighting integration
- **Camera Integration**: Photo capture and gallery access with Capacitor Camera
- **Color Extraction**: Advanced palette generation using ColorThief algorithm
- **WebSocket Communication**: Real-time device status and notification updates
- **Push Notifications**: Firebase/APNS integration for cross-platform notifications
- **Friend System**: Friend management and palette sharing
- **Message History**: Complete message tracking with status indicators
- **OpenAPI Integration**: Type-safe API client generation
- **Cross-platform**: iOS and Android support with Capacitor 7

### 🚧 In Development

- Advanced lighting effects and animations
- Offline mode with local palette storage
- Enhanced color editing tools
- Color palette templates and presets

### 📋 Future Enhancements

#### Planned Features

- Augmented reality color preview
- Voice commands for accessibility
- Multi-language support (i18n)
- Color accessibility tools (colorblind support)
- Advanced social features (groups, public galleries)
- Color trend analysis and recommendations

#### Technical Improvements

- Performance optimization with React Query
- Storybook component documentation
- Comprehensive E2E test coverage
- Performance monitoring and analytics
- Crash reporting integration
- Progressive Web App features
- Advanced caching strategies
