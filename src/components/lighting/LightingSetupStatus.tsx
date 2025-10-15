import React, { useState, useEffect, useCallback } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
  IonBadge,
  IonProgressBar,
  IonAlert,
  IonItem,
  IonLabel,
  IonList,
  IonToast,
} from "@ionic/react";
import {
  checkmarkCircle,
  warning,
  alertCircle,
  refresh,
  play,
  time,
  wifi,
  bulb,
} from "ionicons/icons";
import { useLightingStatus } from "../../hooks/api/useLightingStatus";
import { useLighting } from "../../hooks/api/useLighting";
import { LightingSystemStatusDto } from "../../services/openapi/models/LightingSystemStatusDto";

interface LightingSetupStatusProps {
  deviceId: string;
  deviceName: string;
  onComplete?: () => void;
  autoStartPolling?: boolean;
}

export const LightingSetupStatus: React.FC<LightingSetupStatusProps> = ({
  deviceId,
  deviceName,
  onComplete,
  autoStartPolling = false,
}) => {
  const {
    status,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refreshStatus,
  } = useLightingStatus();
  const { testLighting } = useLighting();

  const [showTestAlert, setShowTestAlert] = useState(false);
  const [testInProgress, setTestInProgress] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "warning" | "danger"
  >("success");
  const [actionInitiatedAt, setActionInitiatedAt] = useState<Date | null>(null);
  const [ignoreStaleStatus, setIgnoreStaleStatus] = useState(false);

  useEffect(() => {
    if (autoStartPolling && deviceId) {
      startPolling(deviceId);
    }
    return () => stopPolling();
  }, [deviceId, autoStartPolling, startPolling, stopPolling]);

  const showToastMessage = (
    message: string,
    color: "success" | "warning" | "danger" = "success"
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const isStatusStale = useCallback(
    (currentStatus: LightingSystemStatusDto | null) => {
      if (!currentStatus || !actionInitiatedAt) return false;

      // If we have a lastTestAt timestamp, check if it's before our action
      if (currentStatus.lightingLastTestAt) {
        const lastTestTime = new Date(currentStatus.lightingLastTestAt);
        return lastTestTime < actionInitiatedAt;
      }

      // If no timestamp, assume stale for 5 seconds after action
      const now = new Date();
      const timeSinceAction = now.getTime() - actionInitiatedAt.getTime();
      return timeSinceAction < 5000; // 5 second grace period
    },
    [actionInitiatedAt]
  );

  // Reset stale status tracking when we get a fresh status
  useEffect(() => {
    if (status && actionInitiatedAt && !isStatusStale(status)) {
      setIgnoreStaleStatus(false);
      setActionInitiatedAt(null);
    }
  }, [status, actionInitiatedAt, isStatusStale]);

  // Debug logging for status changes
  useEffect(() => {
    if (status) {
      console.log("🔍 LightingSetupStatus - REST API Status Update:", {
        deviceId,
        lightingStatus: status.lightingStatus,
        lightingSystemConfigured: status.lightingSystemConfigured,
        lightingLastTestAt: status.lightingLastTestAt,
        requiresAuthentication: status.requiresAuthentication,
        actionInitiatedAt: actionInitiatedAt?.toISOString(),
        isStale: actionInitiatedAt ? isStatusStale(status) : false,
        ignoreStaleStatus,
        fullStatus: status,
      });
    }
  }, [status, deviceId, actionInitiatedAt, isStatusStale, ignoreStaleStatus]);

  const handleTestConnection = async () => {
    setTestInProgress(true);

    console.log(
      "🚀 handleTestConnection - Starting test for device:",
      deviceId
    );

    // Mark when we initiated the action and ignore stale status temporarily
    const actionTime = new Date();
    setActionInitiatedAt(actionTime);
    setIgnoreStaleStatus(true);

    try {
      const success = await testLighting(deviceId);
      if (success) {
        showToastMessage(
          "Test initiated! Waiting for controller response...",
          "success"
        );

        console.log(
          "✅ Test initiated successfully at:",
          actionTime.toISOString()
        );

        // Force an immediate refresh to get current status
        await refreshStatus();

        // Start polling with shorter interval initially, then back off
        if (!isPolling) {
          startPolling(deviceId, 1000); // Poll every 1 second initially for faster response
        }

        // After 10 seconds, reduce polling frequency and stop ignoring stale status
        setTimeout(() => {
          console.log("⏰ 10-second timeout reached, resetting polling");
          if (isPolling) {
            startPolling(deviceId, 3000); // Back to normal 3-second polling
          }
          // Also stop ignoring stale status after reasonable time
          setIgnoreStaleStatus(false);
          setActionInitiatedAt(null);
        }, 10000);
      } else {
        showToastMessage("Failed to initiate test", "danger");
        setIgnoreStaleStatus(false);
        setActionInitiatedAt(null);
      }
    } catch (err) {
      console.error("Test failed to start:", err);
      showToastMessage("Test failed to start", "danger");
      setIgnoreStaleStatus(false);
      setActionInitiatedAt(null);
    } finally {
      setTestInProgress(false);
    }
  };
  const handleStartMonitoring = () => {
    startPolling(deviceId, 3000);
    showToastMessage("Started monitoring lighting system status", "success");
  };

  const handleStopMonitoring = () => {
    stopPolling();
    showToastMessage("Stopped monitoring", "success");
  };

  const getStatusDisplay = () => {
    if (!status) return { text: "Unknown", color: "medium", icon: alertCircle };

    // If we're ignoring stale status and current status appears stale, show waiting status
    if (ignoreStaleStatus && isStatusStale(status)) {
      return { text: "Waiting for Response", color: "warning", icon: time };
    }

    switch (status.lightingStatus) {
      case LightingSystemStatusDto.lightingStatus.WORKING:
        return { text: "Working", color: "success", icon: checkmarkCircle };
      case LightingSystemStatusDto.lightingStatus.ERROR:
        return { text: "Error", color: "danger", icon: alertCircle };
      case LightingSystemStatusDto.lightingStatus.AUTHENTICATION_REQUIRED:
        return {
          text: "Authentication Required",
          color: "warning",
          icon: warning,
        };
      case LightingSystemStatusDto.lightingStatus.UNKNOWN:
      default:
        return { text: "Unknown", color: "medium", icon: alertCircle };
    }
  };

  const getProgressValue = () => {
    if (!status) return 0.1;
    if (
      status.lightingSystemConfigured &&
      status.lightingStatus === LightingSystemStatusDto.lightingStatus.WORKING
    )
      return 1.0;
    if (status.lightingSystemConfigured) return 0.7;
    if (status.lightingSystemType) return 0.3;
    return 0.1;
  };

  const getNextAction = () => {
    if (!status) return null;

    // If we're ignoring stale status and current status appears stale, show waiting message
    if (ignoreStaleStatus && isStatusStale(status)) {
      return {
        text: "Processing...",
        description:
          "Waiting for the lighting controller to respond. This may take a few seconds.",
        action: "wait",
        color: "medium",
      };
    }

    if (
      status.lightingStatus ===
      LightingSystemStatusDto.lightingStatus.AUTHENTICATION_REQUIRED
    ) {
      return {
        text: "Authentication Required",
        description:
          "Please follow the authentication steps for your lighting system",
        action: "authenticate",
        color: "warning",
      };
    }

    if (
      status.lightingStatus === LightingSystemStatusDto.lightingStatus.ERROR
    ) {
      return {
        text: "Connection Error",
        description:
          "There was an issue connecting to your lighting system. Please check configuration.",
        action: "reconfigure",
        color: "danger",
      };
    }

    if (!status.lightingSystemConfigured) {
      return {
        text: "Configuration Needed",
        description: "Lighting system needs to be configured",
        action: "configure",
        color: "primary",
      };
    }

    if (
      status.lightingStatus === LightingSystemStatusDto.lightingStatus.WORKING
    ) {
      return {
        text: "Setup Complete!",
        description: "Your lighting system is working correctly",
        action: "complete",
        color: "success",
      };
    }

    return {
      text: "Test Connection",
      description: "Test your lighting system connection",
      action: "test",
      color: "primary",
    };
  };

  const statusDisplay = getStatusDisplay();
  const nextAction = getNextAction();
  const progress = getProgressValue();

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            Lighting Setup Status - {deviceName}
            {isPolling && (
              <IonBadge color="primary" style={{ marginLeft: "8px" }}>
                Live
              </IonBadge>
            )}
          </IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          {/* Progress Bar */}
          <IonProgressBar
            value={progress}
            color={statusDisplay.color}
          ></IonProgressBar>
          <IonText color="medium">
            <p style={{ margin: "8px 0", fontSize: "14px" }}>
              Setup Progress: {Math.round(progress * 100)}%
            </p>
          </IonText>

          {/* Current Status */}
          <IonList>
            <IonItem>
              <IonIcon
                icon={statusDisplay.icon}
                color={statusDisplay.color}
                slot="start"
              />
              <IonLabel>
                <h3>Status</h3>
                <p>
                  <IonBadge color={statusDisplay.color}>
                    {statusDisplay.text}
                  </IonBadge>
                </p>
              </IonLabel>
            </IonItem>

            {status && (
              <>
                <IonItem>
                  <IonIcon icon={wifi} slot="start" />
                  <IonLabel>
                    <h3>System Type</h3>
                    <p>{status.lightingSystemType || "Not configured"}</p>
                  </IonLabel>
                </IonItem>

                {status.lightingHostAddress && (
                  <IonItem>
                    <IonIcon icon={bulb} slot="start" />
                    <IonLabel>
                      <h3>Host Address</h3>
                      <p>
                        {status.lightingHostAddress}:{status.lightingPort || 80}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}

                {status.lightingLastTestAt && (
                  <IonItem>
                    <IonIcon icon={time} slot="start" />
                    <IonLabel>
                      <h3>Last Test</h3>
                      <p>
                        {new Date(status.lightingLastTestAt).toLocaleString()}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}
              </>
            )}
          </IonList>

          {/* Next Action */}
          {nextAction && (
            <div style={{ marginTop: "16px" }}>
              <IonText color={nextAction.color}>
                <h4>{nextAction.text}</h4>
              </IonText>
              <p style={{ marginBottom: "16px" }}>{nextAction.description}</p>

              {nextAction.action === "complete" && onComplete && (
                <IonButton expand="block" color="success" onClick={onComplete}>
                  <IonIcon icon={checkmarkCircle} slot="start" />
                  Mark Setup Complete
                </IonButton>
              )}

              {nextAction.action === "test" && (
                <IonButton
                  expand="block"
                  onClick={handleTestConnection}
                  disabled={testInProgress}
                >
                  <IonIcon icon={play} slot="start" />
                  {testInProgress ? "Testing..." : "Test Connection"}
                </IonButton>
              )}

              {nextAction.action === "authenticate" && (
                <IonButton
                  expand="block"
                  color="warning"
                  onClick={() => setShowTestAlert(true)}
                >
                  <IonIcon icon={warning} slot="start" />
                  View Authentication Steps
                </IonButton>
              )}

              {nextAction.action === "wait" && (
                <IonButton expand="block" color="medium" disabled>
                  <IonSpinner name="crescent" />
                  <span style={{ marginLeft: "8px" }}>Processing...</span>
                </IonButton>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
            <IonButton
              fill="outline"
              onClick={refreshStatus}
              disabled={loading}
            >
              <IonIcon icon={refresh} slot="start" />
              {loading ? <IonSpinner name="crescent" /> : "Refresh"}
            </IonButton>

            {!isPolling ? (
              <IonButton
                fill="outline"
                color="success"
                onClick={handleStartMonitoring}
              >
                Start Monitoring
              </IonButton>
            ) : (
              <IonButton
                fill="outline"
                color="danger"
                onClick={handleStopMonitoring}
              >
                Stop Monitoring
              </IonButton>
            )}
          </div>

          {error && (
            <IonText color="danger">
              <p style={{ marginTop: "16px" }}>Error: {error}</p>
            </IonText>
          )}

          {/* Debug Panel */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "var(--ion-color-light)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          >
            <strong>🐛 Debug Info:</strong>
            <br />
            <strong>Action Initiated:</strong>{" "}
            {actionInitiatedAt?.toLocaleTimeString() || "No"}
            <br />
            <strong>Ignoring Stale:</strong> {ignoreStaleStatus ? "Yes" : "No"}
            <br />
            <strong>Status Stale:</strong>{" "}
            {status && actionInitiatedAt
              ? isStatusStale(status)
                ? "Yes"
                : "No"
              : "N/A"}
            <br />
            <strong>Last Test At:</strong>{" "}
            {status?.lightingLastTestAt
              ? new Date(status.lightingLastTestAt).toLocaleTimeString()
              : "Never"}
            <br />
            <strong>Raw Status:</strong> {status?.lightingStatus || "None"}
          </div>
        </IonCardContent>
      </IonCard>

      {/* Authentication Alert */}
      <IonAlert
        isOpen={showTestAlert}
        onDidDismiss={() => setShowTestAlert(false)}
        header="Authentication Required"
        message={`Your ${
          status?.lightingSystemType || "lighting system"
        } requires authentication. Please follow these steps:<br><br>
          1. Press the physical button on your lighting system<br>
          2. Look for the authentication light indicator<br>
          3. Click "Test Connection" again within 30 seconds<br><br>
          Some systems may require specific authentication steps - refer to your device manual.`}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Test Now",
            handler: handleTestConnection,
          },
        ]}
      />

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        color={toastColor}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};
