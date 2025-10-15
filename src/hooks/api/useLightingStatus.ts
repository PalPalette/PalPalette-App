import { useState, useEffect, useCallback, useRef } from "react";
import { LightingSystemStatusDto } from "../../services/openapi/models/LightingSystemStatusDto";
import { DevicesService } from "../../services/openapi/services/DevicesService";

export interface UseLightingStatusReturn {
  status: LightingSystemStatusDto | null;
  loading: boolean;
  error: string | null;
  isPolling: boolean;
  startPolling: (deviceId: string, interval?: number) => void;
  stopPolling: () => void;
  refreshStatus: () => Promise<void>;
}

export const useLightingStatus = (
  deviceId?: string
): UseLightingStatusReturn => {
  const [status, setStatus] = useState<LightingSystemStatusDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentDeviceIdRef = useRef<string | null>(null);

  const fetchStatus = useCallback(async (targetDeviceId: string) => {
    if (!targetDeviceId) return;

    try {
      setError(null);
      const newStatus =
        await DevicesService.devicesControllerGetLightingSystemStatus(
          targetDeviceId
        );
      setStatus(newStatus);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch lighting status";
      setError(errorMessage);
      console.error("Failed to fetch lighting status:", err);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!currentDeviceIdRef.current) return;

    setLoading(true);
    try {
      await fetchStatus(currentDeviceIdRef.current);
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  const startPolling = useCallback(
    (targetDeviceId: string, interval: number = 3000) => {
      // Stop any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      currentDeviceIdRef.current = targetDeviceId;
      setIsPolling(true);

      // Initial fetch
      fetchStatus(targetDeviceId);

      // Set up polling
      pollingIntervalRef.current = setInterval(() => {
        fetchStatus(targetDeviceId);
      }, interval);
    },
    [fetchStatus]
  );

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    currentDeviceIdRef.current = null;
  }, []);

  // Initial fetch when deviceId is provided
  useEffect(() => {
    if (deviceId && !isPolling) {
      setLoading(true);
      fetchStatus(deviceId).finally(() => setLoading(false));
    }
  }, [deviceId, fetchStatus, isPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    status,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refreshStatus,
  };
};
