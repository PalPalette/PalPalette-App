# Enhanced Lighting System Setup Flow

## Overview

The lighting system setup flow has been significantly improved with real-time polling capabilities, better user guidance, and enhanced status tracking. The backend now provides comprehensive lighting status information that enables a much more responsive and user-friendly setup experience.

## New Features

### 1. Real-time Status Polling (`useLightingStatus` Hook)

A new custom hook that provides automatic polling of lighting system status with the following capabilities:

```typescript
const {
  status,
  loading,
  error,
  isPolling,
  startPolling,
  stopPolling,
  refreshStatus,
} = useLightingStatus();
```

**Features:**

- Automatic status polling at configurable intervals (default: 3 seconds)
- Manual refresh capability
- Start/stop polling control
- Error handling and loading states
- Cleanup on unmount

### 2. Enhanced Status Component (`LightingSetupStatus`)

A comprehensive status component that provides:

```tsx
<LightingSetupStatus
  deviceId={deviceId}
  deviceName={deviceName}
  onComplete={handleComplete}
  autoStartPolling={true}
/>
```

**Features:**

- Real-time status display with visual indicators
- Progress bar showing setup completion percentage
- Context-aware action buttons based on current status
- Authentication guidance for systems requiring pairing
- Live monitoring toggle
- Test connection functionality with status tracking

### 3. Enhanced Configuration Modal (`LightingConfigModalEnhanced`)

A step-by-step configuration modal with:

```tsx
<LightingConfigModalEnhanced
  isOpen={showModal}
  onDidDismiss={() => setShowModal(false)}
  deviceId={deviceId}
  deviceName={deviceName}
  onConfigComplete={handleComplete}
/>
```

**Features:**

- 3-step wizard (Select → Configure → Monitor)
- Progress tracking across steps
- Live status monitoring during setup
- All supported lighting system types
- Automatic default configuration per system type

## Backend Integration

The enhanced components leverage the new OpenAPI endpoints:

### Status Information (`LightingSystemStatusDto`)

```typescript
{
  lightingSystemType: string;
  lightingHostAddress?: string;
  lightingPort?: number;
  lightingSystemConfigured: boolean;  // ✨ New
  lightingStatus: string;  // unknown, working, error, authentication_required
  lightingLastTestAt?: string;  // ✨ New
  requiresAuthentication: boolean;  // ✨ New
  capabilities?: Record<string, any>;  // ✨ New
  lightingStatusDetails?: Record<string, any>;  // ✨ New
}
```

### Available Endpoints

- `GET /devices/{id}/lighting/status` - Get current lighting system status
- `POST /devices/{id}/lighting/configure` - Configure lighting system
- `POST /devices/{id}/lighting/test` - Test lighting system connection
- `PATCH /devices/{id}/lighting` - Update lighting configuration
- `DELETE /devices/{id}/lighting` - Reset lighting system

## Usage Patterns

### 1. Standalone Status Monitoring

```tsx
import { LightingSetupStatus } from "../components/lighting";

// In your component
<LightingSetupStatus
  deviceId="device-123"
  deviceName="Living Room Display"
  autoStartPolling={true}
  onComplete={() => console.log("Setup complete!")}
/>;
```

### 2. Full Configuration Flow

```tsx
import { LightingConfigModalEnhanced } from "../components/lighting";

// In your component
const [showConfig, setShowConfig] = useState(false);

<LightingConfigModalEnhanced
  isOpen={showConfig}
  onDidDismiss={() => setShowConfig(false)}
  deviceId="device-123"
  deviceName="Living Room Display"
  onConfigComplete={() => {
    setShowConfig(false);
    // Handle completion
  }}
/>;
```

### 3. Custom Status Polling

```tsx
import { useLightingStatus } from "../hooks/api";

const { status, isPolling, startPolling, stopPolling } = useLightingStatus();

// Start monitoring
useEffect(() => {
  if (deviceId) {
    startPolling(deviceId, 2000); // Poll every 2 seconds
  }
  return () => stopPolling();
}, [deviceId]);
```

## Status-Based User Guidance

The system provides intelligent guidance based on the current status:

### Authentication Required

- Shows specific instructions for the lighting system type
- Guides user through physical authentication steps
- Provides timing guidance (e.g., "within 30 seconds")

### Configuration Needed

- Prompts user to complete configuration
- Shows progress and missing settings

### Connection Error

- Displays error details
- Suggests troubleshooting steps
- Offers reconfiguration option

### Working Status

- Confirms successful setup
- Provides completion actions
- Enables ongoing monitoring

## Performance Considerations

### Polling Optimization

- Default 3-second intervals for normal monitoring
- 1-2 second intervals during active setup/testing
- Automatic cleanup when components unmount
- Conditional polling (only when needed)

### Error Handling

- Graceful degradation when API is unavailable
- Retry logic with exponential backoff
- User-friendly error messages
- Fallback to manual refresh

## Migration from Existing Components

The new components are designed to work alongside existing ones:

- `LightingConfigModal` - Original modal (preserved)
- `LightingConfigModalEnhanced` - New enhanced version
- `LightingSetupStatus` - New standalone status component

You can migrate gradually by replacing the original components with enhanced versions as needed.

## Testing Recommendations

1. **Test Authentication Flow**: Verify the authentication guidance works for your lighting systems
2. **Test Polling**: Ensure status updates appear in real-time during setup
3. **Test Error Handling**: Verify graceful handling when devices are offline
4. **Test Step Navigation**: Confirm smooth flow through configuration steps

## Future Enhancements

Potential improvements for future releases:

- WebSocket integration for instant status updates
- Batch configuration for multiple devices
- Advanced error diagnostics and troubleshooting
- Integration with device discovery for automatic configuration
- Historical status tracking and analytics
