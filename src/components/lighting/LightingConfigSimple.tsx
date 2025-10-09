import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonList,
  IonButtons,
  IonIcon,
  IonNote,
  IonSpinner,
  IonAlert,
  IonToast,
} from "@ionic/react";
import { close, checkmark } from "ionicons/icons";
import {
  LightingSystemService,
  LightingSystemConfig,
} from "../../services/LightingSystemService";
import { LightingSystemConfigDto } from "../../services/openapi/models/LightingSystemConfigDto";
import { DeviceAuthNotification } from "../notifications";

interface LightingConfigSimpleProps {
  isOpen: boolean;
  deviceId: string;
  deviceName: string;
  onClose: () => void;
  onConfigured: () => void;
}

const LightingConfigSimple: React.FC<LightingConfigSimpleProps> = ({
  isOpen,
  deviceId,
  deviceName,
  onClose,
  onConfigured,
}) => {
  const [systemType, setSystemType] = useState<
    LightingSystemConfigDto.lightingSystemType | ""
  >("");
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const resetForm = () => {
    setSystemType("");
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    if (!systemType) return false;

    // Only Nanoleaf is supported
    return systemType === "nanoleaf";
  };

  const buildConfiguration = (): LightingSystemConfig => {
    const config: LightingSystemConfig = {
      lightingSystemType:
        systemType as LightingSystemConfigDto.lightingSystemType,
    };

    // Nanoleaf uses auto-discovery, no additional config needed

    return config;
  };

  const handleTestConnection = async () => {
    if (!isFormValid()) {
      setAlertMessage("Please fill in all required fields first.");
      setShowAlert(true);
      return;
    }

    setTestingConnection(true);
    try {
      // First configure, then test
      const config = buildConfiguration();
      await LightingSystemService.configureLightingSystem(deviceId, config);

      const result = await LightingSystemService.testLightingSystem(deviceId);

      if (result.testRequested && result.deviceConnected) {
        setToastMessage("Connection test successful!");
        setShowToast(true);
      } else {
        setAlertMessage("Connection test failed. Please check your settings.");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Test error:", error);
      setAlertMessage("Failed to test connection. Please check your settings.");
      setShowAlert(true);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      setAlertMessage("Please fill in all required fields.");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const config = buildConfiguration();
      await LightingSystemService.configureLightingSystem(deviceId, config);

      setToastMessage("Lighting system configured successfully!");
      setShowToast(true);

      // For Nanoleaf systems, start the authentication process
      if (systemType === "nanoleaf") {
        setIsAuthenticating(true);
        setShowAuthNotification(true);
        // Note: The actual authentication will be triggered by the device
        // after receiving the configuration. The notification component
        // will handle the user interaction prompts.
      } else {
        // For other systems, just close the modal
        setTimeout(() => {
          onConfigured();
          handleClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Configuration error:", error);
      setAlertMessage("Failed to save configuration. Please try again.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticating(false);
    setShowAuthNotification(false);
    onConfigured();
    handleClose();
  };

  const handleAuthFailed = () => {
    setIsAuthenticating(false);
    setShowAuthNotification(false);
    setAlertMessage("Lighting system authentication failed. Please try again.");
    setShowAlert(true);
  };

  const getSystemDescription = (
    type: LightingSystemConfigDto.lightingSystemType
  ) => {
    // Only Nanoleaf is supported
    return type === "nanoleaf"
      ? "Nanoleaf panels with automatic discovery and authentication"
      : "";
  };

  const getRequiredFields = (
    type: LightingSystemConfigDto.lightingSystemType
  ) => {
    // Only Nanoleaf is supported
    return type === "nanoleaf" ? ["Automatic discovery"] : [];
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Configure Lighting</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel position="stacked">Device</IonLabel>
              <IonNote>{deviceName}</IonNote>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Lighting System Type</IonLabel>
              <IonSelect
                value={systemType}
                placeholder="Select lighting system"
                onIonChange={(e) => setSystemType(e.detail.value)}
              >
                <IonSelectOption value="nanoleaf">Nanoleaf</IonSelectOption>
              </IonSelect>
              {systemType && (
                <IonNote>
                  {getSystemDescription(
                    systemType as LightingSystemConfigDto.lightingSystemType
                  )}
                </IonNote>
              )}
            </IonItem>

            {systemType && (
              <>
                {systemType === "nanoleaf" && (
                  <IonItem>
                    <IonLabel>
                      <h3>🔍 Automatic Discovery</h3>
                      <p>
                        Your Nanoleaf devices will be automatically discovered
                        and configured. No manual setup required!
                      </p>
                      <IonNote>
                        During setup, you'll be prompted to press the power
                        button on your Nanoleaf device to enable authentication.
                      </IonNote>
                    </IonLabel>
                  </IonItem>
                )}

                <IonItem>
                  <IonLabel>
                    <h3>Required Fields</h3>
                    <IonNote>
                      {getRequiredFields(
                        systemType as LightingSystemConfigDto.lightingSystemType
                      ).join(", ")}
                    </IonNote>
                  </IonLabel>
                </IonItem>
              </>
            )}
          </IonList>

          {systemType && (
            <div style={{ padding: "16px" }}>
              <IonButton
                expand="block"
                fill="outline"
                onClick={handleTestConnection}
                disabled={!isFormValid() || testingConnection}
              >
                {testingConnection ? (
                  <IonSpinner name="crescent" />
                ) : (
                  "Test Connection"
                )}
              </IonButton>

              <IonButton
                expand="block"
                onClick={handleSave}
                disabled={!isFormValid() || loading}
                style={{ marginTop: "8px" }}
              >
                {loading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  "Save Configuration"
                )}
                {!loading && <IonIcon icon={checkmark} slot="end" />}
              </IonButton>
            </div>
          )}
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Configuration"
        message={alertMessage}
        buttons={["OK"]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color="success"
      />

      <DeviceAuthNotification
        deviceId={deviceId}
        deviceName={deviceName}
        isVisible={showAuthNotification}
        onDismiss={() => {
          setShowAuthNotification(false);
          setIsAuthenticating(false);
        }}
        onSuccess={handleAuthSuccess}
        onFailed={handleAuthFailed}
      />
    </>
  );
};

export default LightingConfigSimple;
