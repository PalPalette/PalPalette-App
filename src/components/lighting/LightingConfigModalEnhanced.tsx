import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonSpinner,
  IonAlert,
  IonBadge,
  IonText,
  IonIcon,
  IonList,
  IonSelect,
  IonSelectOption,
  IonProgressBar,
  IonToast,
} from "@ionic/react";
import { close, wifi } from "ionicons/icons";
import { LightingSystemConfigDto } from "../../services/openapi/models/LightingSystemConfigDto";
import { useLighting } from "../../hooks/api/useLighting";
import { useLightingStatus } from "../../hooks/api/useLightingStatus";
import { LightingSetupStatus } from "./LightingSetupStatus";

interface LightingConfigModalEnhancedProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  deviceId: string;
  deviceName: string;
  onConfigComplete?: () => void;
}

const LightingConfigModalEnhanced: React.FC<
  LightingConfigModalEnhancedProps
> = ({ isOpen, onDidDismiss, deviceId, deviceName, onConfigComplete }) => {
  const {
    configureLighting,
    loading: lightingLoading,
    error: lightingError,
  } = useLighting();
  const { status, startPolling, stopPolling, isPolling } = useLightingStatus();

  const [currentStep, setCurrentStep] = useState<
    "select" | "configure" | "monitor"
  >("select");
  const [config, setConfig] = useState<LightingSystemConfigDto>({
    lightingSystemType: LightingSystemConfigDto.lightingSystemType.NANOLEAF,
    lightingHostAddress: "",
    lightingPort: 80,
    lightingAuthToken: "",
    lightingCustomConfig: {},
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "warning" | "danger"
  >("success");

  // Available lighting system types
  const lightingSystemTypes = [
    {
      value: LightingSystemConfigDto.lightingSystemType.NANOLEAF,
      label: "Nanoleaf Panels",
    },
    { value: LightingSystemConfigDto.lightingSystemType.WLED, label: "WLED" },
    {
      value: LightingSystemConfigDto.lightingSystemType.WS2812,
      label: "WS2812 LED Strip",
    },
    {
      value: LightingSystemConfigDto.lightingSystemType.PHILIPS_HUE,
      label: "Philips Hue",
    },
    {
      value: LightingSystemConfigDto.lightingSystemType.NEOPIXEL,
      label: "NeoPixel",
    },
    {
      value: LightingSystemConfigDto.lightingSystemType.ADDRESSABLE_LED,
      label: "Addressable LED",
    },
    {
      value: LightingSystemConfigDto.lightingSystemType.GENERIC_RGB,
      label: "Generic RGB",
    },
  ];

  useEffect(() => {
    if (isOpen && deviceId) {
      // Initialize with current status if available
      if (status && status.lightingSystemConfigured) {
        setCurrentStep("monitor");
        startPolling(deviceId);
      } else {
        setCurrentStep("select");
      }
    } else if (!isOpen) {
      stopPolling();
    }

    return () => stopPolling();
  }, [isOpen, deviceId, status, startPolling, stopPolling]);

  const showToastMessage = (
    message: string,
    color: "success" | "warning" | "danger" = "success"
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleSystemTypeChange = (
    systemType: LightingSystemConfigDto.lightingSystemType
  ) => {
    setConfig((prev) => ({
      ...prev,
      lightingSystemType: systemType,
      // Set default ports based on system type
      lightingPort:
        systemType === LightingSystemConfigDto.lightingSystemType.WLED
          ? 80
          : systemType === LightingSystemConfigDto.lightingSystemType.NANOLEAF
          ? 16021
          : systemType ===
            LightingSystemConfigDto.lightingSystemType.PHILIPS_HUE
          ? 80
          : 80,
    }));
  };

  const handleConfigureSystem = async () => {
    if (!config.lightingHostAddress?.trim()) {
      setAlertMessage("Please enter a host address for your lighting system");
      setShowAlert(true);
      return;
    }

    try {
      const success = await configureLighting(deviceId, config);

      if (success) {
        showToastMessage("Lighting system configured successfully!", "success");
        setCurrentStep("monitor");
        // Start polling to monitor the configuration
        startPolling(deviceId, 2000); // Poll every 2 seconds initially
      } else {
        showToastMessage(
          "Configuration failed. Please check your settings.",
          "danger"
        );
      }
    } catch (error) {
      console.error("Configuration error:", error);
      setAlertMessage(lightingError || "Failed to configure lighting system");
      setShowAlert(true);
    }
  };

  // Removed handleTestConnection as it's handled by LightingSetupStatus component

  const handleComplete = () => {
    stopPolling();
    if (onConfigComplete) {
      onConfigComplete();
    }
    onDidDismiss();
  };

  const handleClose = () => {
    stopPolling();
    onDidDismiss();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "select":
        return (
          <div>
            <IonText>
              <h2>Select Your Lighting System</h2>
              <p>Choose the type of lighting system you want to configure:</p>
            </IonText>

            <IonList>
              <IonItem>
                <IonLabel>System Type</IonLabel>
                <IonSelect
                  value={config.lightingSystemType}
                  placeholder="Select lighting system"
                  onIonChange={(e) =>
                    handleSystemTypeChange(
                      e.detail
                        .value as LightingSystemConfigDto.lightingSystemType
                    )
                  }
                >
                  {lightingSystemTypes.map((type) => (
                    <IonSelectOption key={type.value} value={type.value}>
                      {type.label}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>

            <IonButton
              expand="block"
              onClick={() => setCurrentStep("configure")}
              style={{ marginTop: "16px" }}
            >
              Continue to Configuration
            </IonButton>
          </div>
        );

      case "configure":
        return (
          <div>
            <IonText>
              <h2>
                Configure{" "}
                {
                  lightingSystemTypes.find(
                    (t) => t.value === config.lightingSystemType
                  )?.label
                }
              </h2>
              <p>Enter the connection details for your lighting system:</p>
            </IonText>

            <IonList>
              <IonItem>
                <IonLabel position="stacked">
                  Host Address (IP Address)
                </IonLabel>
                <IonInput
                  value={config.lightingHostAddress}
                  onIonInput={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      lightingHostAddress: e.detail.value!,
                    }))
                  }
                  placeholder="192.168.1.100"
                  type="text"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Port</IonLabel>
                <IonInput
                  value={config.lightingPort}
                  onIonInput={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      lightingPort: parseInt(e.detail.value!) || 80,
                    }))
                  }
                  placeholder="80"
                  type="number"
                />
              </IonItem>

              {(config.lightingSystemType ===
                LightingSystemConfigDto.lightingSystemType.NANOLEAF ||
                config.lightingSystemType ===
                  LightingSystemConfigDto.lightingSystemType.PHILIPS_HUE) && (
                <IonItem>
                  <IonLabel position="stacked">
                    Auth Token (if available)
                  </IonLabel>
                  <IonInput
                    value={config.lightingAuthToken}
                    onIonInput={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        lightingAuthToken: e.detail.value!,
                      }))
                    }
                    placeholder="Leave empty if not yet obtained"
                    type="password"
                  />
                </IonItem>
              )}
            </IonList>

            <div style={{ marginTop: "16px" }}>
              <IonButton
                expand="block"
                onClick={handleConfigureSystem}
                disabled={
                  lightingLoading || !config.lightingHostAddress?.trim()
                }
              >
                {lightingLoading ? (
                  <>
                    <IonSpinner name="crescent" slot="start" />
                    Configuring...
                  </>
                ) : (
                  <>
                    <IonIcon icon={wifi} slot="start" />
                    Configure System
                  </>
                )}
              </IonButton>

              <IonButton
                fill="outline"
                expand="block"
                onClick={() => setCurrentStep("select")}
                style={{ marginTop: "8px" }}
              >
                Back to System Selection
              </IonButton>
            </div>
          </div>
        );

      case "monitor":
        return (
          <div>
            <IonText>
              <h2>Lighting System Status</h2>
              <p>Monitor your lighting system setup and test the connection:</p>
            </IonText>

            <LightingSetupStatus
              deviceId={deviceId}
              deviceName={deviceName}
              onComplete={handleComplete}
              autoStartPolling={true}
            />

            <div style={{ marginTop: "16px" }}>
              <IonButton
                fill="outline"
                expand="block"
                onClick={() => setCurrentStep("configure")}
              >
                Reconfigure System
              </IonButton>
            </div>
          </div>
        );
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case "select":
        return 0.33;
      case "configure":
        return 0.66;
      case "monitor":
        return 1.0;
      default:
        return 0;
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              Lighting Setup - {deviceName}
              {isPolling && (
                <IonBadge
                  color="success"
                  style={{ marginLeft: "8px", fontSize: "12px" }}
                >
                  LIVE
                </IonBadge>
              )}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {/* Progress Indicator */}
          <div style={{ marginBottom: "24px" }}>
            <IonProgressBar value={getStepProgress()} color="primary" />
            <IonText color="medium">
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                Step{" "}
                {currentStep === "select"
                  ? "1"
                  : currentStep === "configure"
                  ? "2"
                  : "3"}{" "}
                of 3
              </p>
            </IonText>
          </div>

          {renderStepContent()}
        </IonContent>
      </IonModal>

      {/* Alert for errors */}
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Configuration Error"
        message={alertMessage}
        buttons={["OK"]}
      />

      {/* Toast for success/info messages */}
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

export default LightingConfigModalEnhanced;
