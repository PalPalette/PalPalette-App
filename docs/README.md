# PalPalette Mobile App

A cross-platform mobile app for camera-based color extraction and smart lighting control. Capture colors from photos, create palettes, and share them with friends while controlling ESP32/ESP8266 devices and lighting systems (Nanoleaf, RGB LEDs).

**Platforms**: iOS, Android  
**Framework**: Ionic React + Capacitor  
**Version**: 0.0.1

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run on Android
npm run cap:run:android:dev

# Run on iOS (macOS only)
npm run cap:run:ios:dev
```

## Features

- 📸 **Camera Color Extraction** - Capture photos and extract color palettes using ColorThief algorithm
- 🎨 **Manual Color Control** - Create custom color palettes with RGB picker
- 🔗 **Device Management** - Pair and control ESP32/ESP8266 devices via WebSocket
- 💡 **Smart Lighting** - Control Nanoleaf and generic RGB lighting systems
- 👥 **Social Sharing** - Share color palettes with friends in real-time
- 🔔 **Push Notifications** - Firebase (Android) and APNS (iOS) integration
- 🔐 **Authentication** - JWT-based auth with automatic token refresh

## Tech Stack

- **Framework**: Ionic 8.5 + React 19 + TypeScript
- **Build**: Vite 7.1
- **Mobile**: Capacitor 7.4
- **API**: OpenAPI auto-generated clients
- **State**: React Context
- **Styling**: Ionic CSS + Custom themes

## Project Structure

```
src/
├── components/     # UI components by domain (devices, lighting, common)
├── contexts/       # React Context (Auth, Device, DeveloperMode)
├── hooks/          # Custom hooks (api/, device/, ui/)
├── pages/          # Main screens (Login, Devices, PaletteCreator, etc.)
├── services/       # API clients, Camera, ColorExtraction, WebSocket
├── config/         # Environment and API configuration
└── utils/          # Helper functions
```

## Available Scripts

```bash
# Development
npm run dev                 # Vite dev server
npm run api:update          # Regenerate API client from OpenAPI spec

# Mobile
npm run cap:run:android:dev # Build & run Android (dev mode)
npm run cap:run:ios:dev     # Build & run iOS (dev mode)
npm run cap:open:android    # Open Android Studio
npm run cap:open:ios        # Open Xcode

# Build & Deploy
npm run build               # Production build
npm run build:mobile        # Build + sync to native platforms

# Testing
npm run test.unit           # Vitest unit tests
npm run test.e2e            # Cypress E2E tests
npm run lint                # ESLint
```

## Configuration

Create `.env` file:

```bash
VITE_BACKEND_URL=http://localhost:3000
VITE_WEBSOCKET_URL=http://localhost:3001
VITE_ENVIRONMENT=development
VITE_DEBUG_MODE=true
```

## Troubleshooting

**Build fails**: Clear cache with `rm -rf node_modules/.vite && npm install`  
**Camera not working**: Check permissions in [capacitor.config.ts](../capacitor.config.ts)  
**API errors**: Run `npm run api:update` to regenerate OpenAPI client
