import React, { useState, useEffect } from "react";
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

  const handleTestConnection = async () => {
    setTestInProgress(true);
    try {
      const success = await testLighting(deviceId);
      if (success) {
        showToastMessage(
          "Test initiated! Check status for results.",
          "success"
        );
        // Start polling to catch the test results
        if (!isPolling) {
          startPolling(deviceId, 2000); // Poll every 2 seconds during test
        }
      } else {
        showToastMessage("Failed to initiate test", "danger");
      }
    } catch (err) {
      console.error("Test failed to start:", err);
      showToastMessage("Test failed to start", "danger");
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

    switch (status.lightingStatus) {
      case "working":
        return { text: "Working", color: "success", icon: checkmarkCircle };
      case "error":
        return { text: "Error", color: "danger", icon: alertCircle };
      case "authentication_required":
        return {
          text: "Authentication Required",
          color: "warning",
          icon: warning,
        };
      case "unknown":
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

    if (status.lightingStatus === "authentication_required") {
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
