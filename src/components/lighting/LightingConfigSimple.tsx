import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonAlert,
  IonToast,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
} from "@ionic/react";
import { close, checkmark, bulb, wifi, flash, warning } from "ionicons/icons";
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

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .card-hover {
            transition: all 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
          }
          
          .gradient-button {
            background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary)) !important;
          }
        `}
      </style>
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
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "var(--ion-color-dark)",
                }}
              >
                Configure Lighting
              </h2>
              <p
                style={{
                  color: "var(--ion-color-medium)",
                  fontSize: "16px",
                  lineHeight: "1.5",
                  margin: "0 auto",
                  maxWidth: "280px",
                }}
              >
                Set up your lighting system for {deviceName}
              </p>
            </IonText>
          </div>

          {/* Device Info Card */}
          <IonCard
            className="card-hover"
            style={{
              marginBottom: "24px",
              borderRadius: "16px",
              border: "2px solid var(--ion-color-light)",
              animation: "fadeInUp 0.6s ease-out",
            }}
          >
            <IonCardContent style={{ padding: "20px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "var(--ion-color-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IonIcon
                    icon={flash}
                    style={{
                      fontSize: "24px",
                      color: "var(--ion-color-medium)",
                    }}
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
                    Device
                  </h3>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "15px",
                      color: "var(--ion-color-medium)",
                    }}
                  >
                    {deviceName}
                  </p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* System Selection Card */}
          <IonCard
            className="card-hover"
            style={{
              marginBottom: "24px",
              borderRadius: "16px",
              border: systemType
                ? "2px solid var(--ion-color-primary)"
                : "2px solid var(--ion-color-light)",
              transition: "all 0.3s ease",
              animation: "fadeInUp 0.6s ease-out 0.2s both",
            }}
          >
            <IonCardHeader style={{ paddingBottom: "12px" }}>
              <IonCardTitle
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "var(--ion-color-dark)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <IonIcon
                  icon={bulb}
                  style={{
                    fontSize: "24px",
                    color: "var(--ion-color-primary)",
                  }}
                />
                Lighting System
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: "0" }}>
              <IonSelect
                value={systemType}
                placeholder="Select your lighting system"
                interface="popover"
                onIonChange={(e) => setSystemType(e.detail.value)}
                style={{
                  "--background": "var(--ion-color-light)",
                  "--border-radius": "12px",
                  "--padding-start": "16px",
                  "--padding-end": "16px",
                }}
              >
                <IonSelectOption value="nanoleaf">
                  🔮 Nanoleaf Smart Panels
                </IonSelectOption>
              </IonSelect>

              {systemType && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(var(--ion-color-success-rgb), 0.1)",
                    border: "1px solid rgba(var(--ion-color-success-rgb), 0.2)",
                  }}
                >
                  <IonText>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14px",
                        color: "var(--ion-color-success)",
                        fontWeight: "500",
                      }}
                    >
                      ✨{" "}
                      {getSystemDescription(
                        systemType as LightingSystemConfigDto.lightingSystemType
                      )}
                    </p>
                  </IonText>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Configuration Details */}
          {systemType === "nanoleaf" && (
            <IonCard
              className="card-hover"
              style={{
                marginBottom: "24px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, rgba(var(--ion-color-primary-rgb), 0.05), rgba(var(--ion-color-secondary-rgb), 0.02))",
                border: "2px solid rgba(var(--ion-color-primary-rgb), 0.15)",
                animation: "fadeInUp 0.6s ease-out 0.4s both",
              }}
            >
              <IonCardContent style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "var(--ion-color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        "0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3)",
                    }}
                  >
                    <IonIcon
                      icon={wifi}
                      style={{
                        fontSize: "24px",
                        color: "white",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "var(--ion-color-primary)",
                      }}
                    >
                      🔍 Automatic Discovery
                    </h3>
                    <p
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "15px",
                        color: "var(--ion-color-dark)",
                        lineHeight: "1.4",
                      }}
                    >
                      Your Nanoleaf devices will be automatically discovered and
                      configured. No manual setup required!
                    </p>
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        background: "rgba(var(--ion-color-warning-rgb), 0.1)",
                        border:
                          "1px solid rgba(var(--ion-color-warning-rgb), 0.2)",
                      }}
                    >
                      <IonText>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "13px",
                            color: "var(--ion-color-warning-shade)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <IonIcon
                            icon={warning}
                            style={{ fontSize: "16px" }}
                          />
                          During setup, you'll be prompted to press the power
                          button on your Nanoleaf device
                        </p>
                      </IonText>
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* Action Buttons */}
          {systemType && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "32px",
              }}
            >
              <IonButton
                expand="block"
                fill="outline"
                size="large"
                onClick={handleTestConnection}
                disabled={!isFormValid() || testingConnection}
                style={{
                  "--border-radius": "16px",
                  height: "48px",
                  fontWeight: "600",
                }}
              >
                {testingConnection ? (
                  <>
                    <IonSpinner name="crescent" slot="start" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <IonIcon icon={flash} slot="start" />
                    Test Connection
                  </>
                )}
              </IonButton>

              <IonButton
                expand="block"
                size="large"
                onClick={handleSave}
                disabled={!isFormValid() || loading}
                className="gradient-button"
                style={{
                  "--border-radius": "16px",
                  height: "48px",
                  fontWeight: "600",
                }}
              >
                {loading ? (
                  <>
                    <IonSpinner name="crescent" slot="start" />
                    Configuring...
                  </>
                ) : (
                  <>
                    <IonIcon icon={checkmark} slot="start" />
                    Save Configuration
                  </>
                )}
              </IonButton>
            </div>
          )}

          {/* Empty State */}
          {!systemType && (
            <div
              style={{
                textAlign: "center",
                marginTop: "40px",
                padding: "32px 16px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "var(--ion-color-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <IonIcon
                  icon={bulb}
                  style={{
                    fontSize: "32px",
                    color: "var(--ion-color-medium)",
                  }}
                />
              </div>
              <IonText>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "18px",
                    fontWeight: "500",
                    color: "var(--ion-color-medium)",
                  }}
                >
                  Select a Lighting System
                </h3>
                <p
                  style={{
                    margin: "0",
                    fontSize: "14px",
                    color: "var(--ion-color-medium)",
                    lineHeight: "1.4",
                  }}
                >
                  Choose your lighting system type to get started with the
                  configuration
                </p>
              </IonText>
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
