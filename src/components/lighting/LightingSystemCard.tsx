import React, { useState, useEffect, useCallback, memo } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonItem,
  IonLabel,
  IonSpinner,
  IonToast,
} from "@ionic/react";
import { bulb, settings } from "ionicons/icons";
import {
  LightingSystemService,
  LightingSystemStatus,
  LightingStatus,
} from "../../services/LightingSystemService";
import { useLoading, useToast } from "../../hooks";
import { useDeveloperMode } from "../../hooks/useDeveloperMode";

interface LightingSystemCardProps {
  deviceId: string;
  onConfigureClick: () => void;
}

const LightingSystemCard: React.FC<LightingSystemCardProps> = memo(
  ({ deviceId, onConfigureClick }) => {
    const { loading } = useLoading();
    const { isDeveloperMode } = useDeveloperMode();
    const { toastState, hideToast } = useToast();

    const [status, setStatus] = useState<LightingSystemStatus | null>(null);
    // const [showAlert, setShowAlert] = useState(false);
    // const [alertMessage, setAlertMessage] = useState("");

    const loadStatus = useCallback(async () => {
      try {
        const lightingStatus =
          await LightingSystemService.getLightingSystemStatus(deviceId);
        setStatus(lightingStatus);
      } catch (error) {
        console.error("Error loading lighting status:", error);
        // Device might not have lighting configured yet, which is okay
      }
    }, [deviceId]);

    useEffect(() => {
      loadStatus();

      // Poll for status updates every 30 seconds
      const intervalId = setInterval(loadStatus, 30000);

      return () => clearInterval(intervalId);
    }, [loadStatus]);

    // const handleTest = async () => {
    //   try {
    //     await withLoading(LightingSystemService.testLightingSystem(deviceId));
    //     showSuccess("Test request sent to device!");
    //     // Refresh status after a delay
    //     setTimeout(loadStatus, 3000);
    //   } catch (error: unknown) {
    //     console.error("Error testing lighting system:", error);
    //     setAlertMessage("Failed to test lighting system");
    //     setShowAlert(true);
    //   }
    // };

    const getSystemIcon = () => {
      // Only Nanoleaf is supported
      return bulb;
    };

    if (loading && !status) {
      return (
        <IonCard>
          <IonCardContent style={{ textAlign: "center", padding: "2rem" }}>
            <IonSpinner name="crescent" />
            <p>Loading lighting system...</p>
          </IonCardContent>
        </IonCard>
      );
    }

    return (
      <>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <IonIcon icon={getSystemIcon()} />
                Lighting System
              </div>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {status ? (
              <>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>System Type</h3>
                    <p>
                      {LightingSystemService.getLightingSystemDisplayName(
                        status.lightingSystemType || "unknown"
                      )}
                    </p>
                  </IonLabel>
                </IonItem>

                <IonItem lines="none">
                  <IonLabel>
                    <h3>Status</h3>
                    <p>
                      <IonBadge
                        color={LightingSystemService.getStatusColor(
                          status.lightingStatus
                        )}
                      >
                        {LightingSystemService.getStatusDisplayText(
                          status.lightingStatus
                        )}
                      </IonBadge>
                    </p>
                  </IonLabel>
                </IonItem>

                {isDeveloperMode && status.lightingHostAddress && (
                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Host Address</h3>
                      <p>
                        {status.lightingHostAddress}:{status.lightingPort}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}

                {isDeveloperMode && status.lightingLastTestAt && (
                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Last Tested</h3>
                      <p>
                        {new Date(status.lightingLastTestAt).toLocaleString()}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
                  <IonButton
                    fill="outline"
                    size="small"
                    onClick={onConfigureClick}
                  >
                    <IonIcon icon={settings} slot="start" />
                    {status.lightingSystemType === "nanoleaf"
                      ? "Re-authenticate"
                      : "Configure"}
                  </IonButton>
                </div>
              </>
            ) : (
              <>
                <p>No lighting system configured for this device.</p>
                <IonButton
                  expand="block"
                  onClick={onConfigureClick}
                  color="primary"
                >
                  <IonIcon icon={settings} slot="start" />
                  Setup Lighting System
                </IonButton>
              </>
            )}
          </IonCardContent>
        </IonCard>

        {/* Test alert removed */}

        <IonToast
          isOpen={toastState.isOpen}
          message={toastState.message}
          duration={toastState.duration}
          onDidDismiss={hideToast}
          color={toastState.color}
        />
      </>
    );
  }
);

LightingSystemCard.displayName = "LightingSystemCard";

export default LightingSystemCard;
