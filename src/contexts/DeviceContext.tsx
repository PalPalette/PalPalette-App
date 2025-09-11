import React, {
  createContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Device } from "../services/openapi/models/Device";
import { DevicesService } from "../services/openapi/services/DevicesService";
import { ClaimByCodeDto } from "../services/openapi/models/ClaimByCodeDto";
import { useAuth } from "../hooks/useContexts";

export interface DeviceContextType {
  devices: Device[];
  loading: boolean;
  refreshDevices: () => Promise<void>;
  claimDeviceByCode: (pairingCode: string, name: string) => Promise<boolean>;
  resetDevice: (deviceId: string) => Promise<boolean>;
  sendColorToDevice: (deviceId: string, color: string) => void;
  // Legacy support (deprecated)
  claimDevice: (
    deviceId: string,
    setupSecret: string,
    name: string
  ) => Promise<boolean>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const fetchInProgressRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const refreshDevices = useCallback(async () => {
    if (!token || !isAuthenticated || fetchInProgressRef.current) {
      console.log("🚫 Skipping device fetch:", {
        hasToken: !!token,
        isAuthenticated,
        fetchInProgress: fetchInProgressRef.current,
      });
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setLoading(true);
      console.log("🔄 Fetching devices from API...");
      const devicesData = await DevicesService.devicesControllerGetMyDevices();
      setDevices(devicesData as Device[]);
      console.log(`✅ Fetched ${devicesData.length} devices`);
    } catch (error) {
      console.error("Failed to refresh devices:", error);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [token, isAuthenticated]);

  // Auto-fetch devices when user becomes authenticated (only once)
  useEffect(() => {
    if (isAuthenticated && token && !hasInitializedRef.current) {
      console.log("🚀 Auto-fetching devices on auth...");
      hasInitializedRef.current = true;
      refreshDevices();
    }
  }, [isAuthenticated, token, refreshDevices]);

  const claimDeviceByCode = useCallback(
    async (pairingCode: string, name: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setLoading(true);
        const dto: ClaimByCodeDto = { pairingCode, deviceName: name };
        await DevicesService.devicesControllerClaimByCode(dto);
        await refreshDevices();
        return true;
      } catch (error) {
        console.error("Failed to claim device by code:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, refreshDevices]
  );

  const resetDevice = useCallback(
    async (deviceId: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setLoading(true);
        await DevicesService.devicesControllerResetDevice(deviceId);
        await refreshDevices();
        return true;
      } catch (error) {
        console.error("Failed to reset device:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, refreshDevices]
  );

  // Legacy claim device method (deprecated)
  const claimDevice = async (
    deviceId: string,
    setupSecret: string,
    name: string
  ): Promise<boolean> => {
    console.warn("claimDevice is deprecated, use claimDeviceByCode instead");
    // For backward compatibility, try to use setupSecret as pairingCode
    return claimDeviceByCode(setupSecret, name);
  };

  // TODO: Refactor sendColorToDevice to use generated service if available
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendColorToDevice = (deviceId: string, color: string) => {
    // Implement using DevicesService if endpoint exists
    console.warn("sendColorToDevice not yet refactored to OpenAPI");
  };

  const value: DeviceContextType = {
    devices,
    loading,
    refreshDevices,
    claimDeviceByCode,
    resetDevice,
    claimDevice, // Legacy support
    sendColorToDevice,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};

export { DeviceContext };
