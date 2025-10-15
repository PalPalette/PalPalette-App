import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonProgressBar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonContent,
  IonToast,
} from "@ionic/react";
import {
  bulb,
  checkmarkCircle,
  closeCircle,
  informationCircle,
  power,
  refresh,
  keypad,
} from "ionicons/icons";
import { DevicesService } from "../../services/openapi/services/DevicesService";
import { LightingSystemStatusDto } from "../../services/openapi/models/LightingSystemStatusDto";

// Simplified authentication state based on REST API data
interface AuthenticationState {
  deviceId: string;
  isAuthenticating: boolean;
  currentStep:
    | "press_power_button"
    | "enter_pairing_code"
    | "success"
    | "failed"
    | "waiting";
  message: string;
  pairingCode?: string;
  lastUpdate: number;
}

interface DeviceAuthNotificationProps {
  deviceId: string;
  deviceName?: string;
  isVisible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
  onFailed?: () => void;
  onRetry?: () => void;
}

const DeviceAuthNotification: React.FC<DeviceAuthNotificationProps> = ({
  deviceId,
  deviceName = "Device",
  isVisible,
  onDismiss,
  onSuccess,
  onFailed,
  onRetry,
}) => {
  const [authState, setAuthState] = useState<AuthenticationState | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [lightingStatus, setLightingStatus] =
    useState<LightingSystemStatusDto | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const authStateRef = useRef<AuthenticationState | null>(null);

  // Update ref whenever authState changes
  useEffect(() => {
    authStateRef.current = authState;
  }, [authState]);

  // Pure REST API polling function
  const pollLightingStatus = useCallback(async () => {
    try {
      const status =
        await DevicesService.devicesControllerGetLightingSystemStatus(deviceId);
      setLightingStatus(status);

      // Handle different status states
      if (
        status.lightingStatus === LightingSystemStatusDto.lightingStatus.WORKING
      ) {
        // Authentication successful - only when status is explicitly 'working'
        const newState: AuthenticationState = {
          deviceId,
          isAuthenticating: false,
          currentStep: "success",
          message: "Device connected successfully!",
          lastUpdate: Date.now(),
        };
        setAuthState(newState);
        setToastMessage("Device connected successfully!");
        setShowToast(true);

        // Stop polling and call success after a brief delay
        setIsPolling(false);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else if (
        status.lightingStatus === LightingSystemStatusDto.lightingStatus.ERROR
      ) {
        // Authentication failed

        const newState: AuthenticationState = {
          deviceId,
          isAuthenticating: false,
          currentStep: "failed",
          message: "Authentication failed. Please try again.",
          lastUpdate: Date.now(),
        };
        setAuthState(newState);
        setToastMessage("Authentication failed. Please try again.");
        setShowToast(true);

        setIsPolling(false);
        setTimeout(() => {
          onFailed?.();
        }, 3000);
      } else if (
        status.lightingStatus ===
        LightingSystemStatusDto.lightingStatus.AUTHENTICATION_REQUIRED
      ) {
        // Authentication explicitly required - determine step from backend data
        const pairingCode = status.lightingStatusDetails?.pairingCode;
        const authStep = status.lightingStatusDetails?.authStep;

        let currentStep: AuthenticationState["currentStep"];
        let message: string;

        if (pairingCode) {
          currentStep = "enter_pairing_code";
          message = "Enter the pairing code in your lighting app";
        } else if (authStep === "press_power_button" || !authStep) {
          currentStep = "press_power_button";
          message = "Press the power button on your device to start pairing";
        } else {
          currentStep = "waiting";
          message = "Authentication required - follow device instructions";
        }

        const newState: AuthenticationState = {
          deviceId,
          isAuthenticating: true,
          currentStep,
          message,
          pairingCode,
          lastUpdate: Date.now(),
        };
        setAuthState(newState);

        // Show toast for step changes
        if (
          !authStateRef.current ||
          authStateRef.current.currentStep !== currentStep
        ) {
          setToastMessage(message);
          setShowToast(true);
        }
      } else if (
        status.requiresAuthentication &&
        status.lightingStatus ===
          LightingSystemStatusDto.lightingStatus.UNKNOWN &&
        status.lightingSystemConfigured
      ) {
        // System is configured but status is unknown and requires auth - wait for backend to determine next step
        const newState: AuthenticationState = {
          deviceId,
          isAuthenticating: true,
          currentStep: "waiting",
          message: "Checking system status...",
          lastUpdate: Date.now(),
        };
        setAuthState(newState);

        // Don't show success toast in this case - just wait
      }
    } catch {
      setToastMessage("Connection error - retrying...");
      setShowToast(true);
    }
  }, [deviceId, onSuccess, onFailed]); // Remove authState dependency to avoid loops

  // Polling functions are now inlined in the useEffect to avoid dependency cycles

  // Handle visibility changes - inline polling logic to avoid dependency cycles
  useEffect(() => {
    if (isVisible && deviceId) {
      if (!pollingIntervalRef.current) {
        setIsPolling(true);
        // Initial poll
        pollLightingStatus();
        // Set up interval
        pollingIntervalRef.current = setInterval(() => {
          pollLightingStatus();
        }, 2000);
      }
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setIsPolling(false);
      }
    }

    // Cleanup when component unmounts or visibility changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setIsPolling(false);
      }
    };
  }, [isVisible, deviceId, pollLightingStatus]);

  const handleRetry = () => {
    setAuthState(null);

    // Restart polling inline
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);
    pollLightingStatus();
    pollingIntervalRef.current = setInterval(() => {
      pollLightingStatus();
    }, 2000);

    onRetry?.();
  };

  const getStepIcon = (step: AuthenticationState["currentStep"] | null) => {
    switch (step) {
      case "press_power_button":
        return power;
      case "enter_pairing_code":
        return keypad;
      case "success":
        return checkmarkCircle;
      case "failed":
        return closeCircle;
      default:
        return informationCircle;
    }
  };

  const getStepColor = (step: AuthenticationState["currentStep"] | null) => {
    switch (step) {
      case "press_power_button":
      case "enter_pairing_code":
      case "waiting":
        return "warning";
      case "success":
        return "success";
      case "failed":
        return "danger";
      default:
        return "medium";
    }
  };

  const getProgressValue = (
    step: AuthenticationState["currentStep"] | null
  ) => {
    switch (step) {
      case "press_power_button":
        return 0.3;
      case "enter_pairing_code":
        return 0.6;
      case "success":
        return 1.0;
      case "failed":
        return 0.1;
      default:
        return 0.1;
    }
  };

  return (
    <>
      <IonModal isOpen={isVisible} onDidDismiss={onDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Device Authentication</IonTitle>
            <IonButton
              slot="end"
              fill="clear"
              onClick={onDismiss}
              style={{ marginRight: "8px" }}
            >
              <IonIcon icon={closeCircle} />
            </IonButton>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {/* Header Section */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "32px",
              paddingTop: "16px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 24px rgba(var(--ion-color-primary-rgb), 0.2)",
              }}
            >
              <IonIcon
                icon={bulb}
                style={{
                  fontSize: "40px",
                  color: "white",
                }}
              />
            </div>
            <IonText>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "var(--ion-color-dark)",
                }}
              >
                Connecting {deviceName}
              </h2>
              <p
                style={{
                  color: "var(--ion-color-medium)",
                  fontSize: "16px",
                  lineHeight: "1.5",
                  margin: "0",
                }}
              >
                Setting up your lighting system
              </p>
            </IonText>
          </div>

          {/* Progress Section */}
          <IonCard style={{ marginBottom: "24px", borderRadius: "16px" }}>
            <IonCardContent style={{ padding: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <IonProgressBar
                  value={getProgressValue(authState?.currentStep || null)}
                  color={getStepColor(authState?.currentStep || null)}
                  style={{ height: "8px", borderRadius: "4px" }}
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `var(--ion-color-${getStepColor(
                      authState?.currentStep || null
                    )})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IonIcon
                    icon={getStepIcon(authState?.currentStep || null)}
                    style={{ fontSize: "24px", color: "white" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "var(--ion-color-dark)",
                    }}
                  >
                    {authState?.currentStep === "press_power_button" &&
                      "Press Power Button"}
                    {authState?.currentStep === "enter_pairing_code" &&
                      "Enter Pairing Code"}
                    {authState?.currentStep === "success" &&
                      "Connection Successful"}
                    {authState?.currentStep === "failed" && "Connection Failed"}
                    {(!authState?.currentStep ||
                      authState?.currentStep === "waiting") &&
                      "Initializing..."}
                  </h3>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "15px",
                      color: "var(--ion-color-medium)",
                      lineHeight: "1.4",
                    }}
                  >
                    {authState?.message || "Preparing authentication..."}
                  </p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Pairing Code Display */}
          {authState?.currentStep === "enter_pairing_code" &&
            authState?.pairingCode && (
              <IonCard
                style={{
                  marginBottom: "24px",
                  borderRadius: "16px",
                  background: "rgba(var(--ion-color-warning-rgb), 0.1)",
                }}
              >
                <IonCardHeader>
                  <IonCardTitle
                    style={{
                      fontSize: "18px",
                      color: "var(--ion-color-warning-shade)",
                    }}
                  >
                    <IonIcon icon={keypad} style={{ marginRight: "8px" }} />
                    Pairing Code
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "var(--ion-color-warning)",
                      color: "white",
                      fontSize: "32px",
                      fontWeight: "bold",
                      letterSpacing: "4px",
                      fontFamily: "monospace",
                    }}
                  >
                    {authState.pairingCode}
                  </div>
                  <p
                    style={{
                      margin: "16px 0 0 0",
                      textAlign: "center",
                      fontSize: "14px",
                      color: "var(--ion-color-medium)",
                    }}
                  >
                    Enter this code in your lighting device's app
                  </p>
                </IonCardContent>
              </IonCard>
            )}

          {/* Status Information */}
          <IonList style={{ borderRadius: "16px", marginBottom: "24px" }}>
            <IonItem>
              <IonLabel>
                <h3>Status</h3>
                <p>{lightingStatus?.lightingStatus || "Checking..."}</p>
              </IonLabel>
              <IonChip
                color={getStepColor(authState?.currentStep || null)}
                slot="end"
              >
                {authState?.isAuthenticating ? "Active" : "Ready"}
              </IonChip>
            </IonItem>

            {isPolling && (
              <IonItem>
                <IonLabel>
                  <h3>Monitoring</h3>
                  <p>Watching for device response...</p>
                </IonLabel>
                <IonSpinner name="dots" slot="end" />
              </IonItem>
            )}
          </IonList>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "32px",
            }}
          >
            {authState?.currentStep === "failed" && (
              <IonButton
                expand="block"
                size="large"
                onClick={handleRetry}
                style={{
                  "--border-radius": "16px",
                  height: "48px",
                  fontWeight: "600",
                }}
              >
                <IonIcon icon={refresh} slot="start" />
                Try Again
              </IonButton>
            )}

            <IonButton
              expand="block"
              fill="outline"
              size="large"
              onClick={onDismiss}
              style={{
                "--border-radius": "16px",
                height: "48px",
                fontWeight: "600",
              }}
            >
              Close
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />
    </>
  );
};

export default memo(DeviceAuthNotification);
