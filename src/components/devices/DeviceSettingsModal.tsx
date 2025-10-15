import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAlert,
  IonItem,
  IonLabel,
  IonList,
  IonBadge,
  IonNote,
  IonToast,
} from "@ionic/react";
import {
  settingsOutline,
  trashOutline,
  informationCircleOutline,
  wifiOutline,
  timeOutline,
} from "ionicons/icons";
import { Device } from "../../services/openapi/models/Device";
import { useLoading, useToast } from "../../hooks";

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  onDeviceReset: (deviceId: string) => Promise<void>;
}

const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  isOpen,
  onClose,
  device,
  onDeviceReset,
}) => {
  const { loading, withLoading } = useLoading();
  const { toastState, showSuccess, showError, hideToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    if (!device) return;

    try {
      await withLoading(onDeviceReset(device.id));
      showSuccess(
        "Device reset successfully! It can now be paired with a new account."
      );
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      // OpenAPI errors may be plain Error or ApiError
      let message = "Failed to reset device";
      if (error?.status === 404) {
        message = "Device not found. It may have already been reset.";
      } else if (error?.status === 403) {
        message = "You don't have permission to reset this device.";
      } else if (error?.message) {
        message = error.message;
      }
      showError(message);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (!device) return null;

  return (
    <>
      <style>
        {`
          .reset-device-alert {
            --backdrop-opacity: 0.6;
          }
          
          .reset-device-alert .alert-wrapper {
            --border-radius: 12px;
            --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
          
          .reset-device-alert .alert-head {
            padding: 20px 20px 0;
          }
          
          .reset-device-alert .alert-message {
            padding: 16px 20px;
            font-size: 14px;
            line-height: 1.5;
            color: var(--ion-color-medium-shade);
            white-space: pre-line;
          }
          
          .reset-device-alert .alert-button-group {
            padding: 8px;
            gap: 8px;
          }
          
          .alert-button-cancel {
            --background: var(--ion-color-light);
            --color: var(--ion-color-dark);
            --border-radius: 8px;
            font-weight: 500;
          }
          
          .alert-button-confirm {
            --background: var(--ion-color-danger);
            --color: white;
            --border-radius: 8px;
            font-weight: 600;
          }
        `}
      </style>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Device Settings</IonTitle>
            <IonButton
              fill="clear"
              slot="end"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </IonButton>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {/* Device Information */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={informationCircleOutline} /> Device Information
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h3>Device Name</h3>
                    <p>{device.name}</p>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <h3>Device Type</h3>
                    <p>{device.type.toUpperCase()}</p>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <h3>Status</h3>
                    <p>
                      <IonBadge color={device.isOnline ? "success" : "medium"}>
                        {device.isOnline ? "Online" : "Offline"}
                      </IonBadge>{" "}
                      <IonBadge
                        color={device.isProvisioned ? "success" : "warning"}
                      >
                        {device.isProvisioned ? "Configured" : "Setup Required"}
                      </IonBadge>
                    </p>
                  </IonLabel>
                </IonItem>

                {device.macAddress && (
                  <IonItem>
                    <IonLabel>
                      <h3>MAC Address</h3>
                      <p style={{ fontFamily: "monospace" }}>
                        {device.macAddress}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}

                {device.ipAddress && (
                  <IonItem>
                    <IonIcon icon={wifiOutline} slot="start" />
                    <IonLabel>
                      <h3>IP Address</h3>
                      <p style={{ fontFamily: "monospace" }}>
                        {device.ipAddress}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}

                <IonItem>
                  <IonIcon icon={timeOutline} slot="start" />
                  <IonLabel>
                    <h3>Last Seen</h3>
                    <p>{formatDate(device.lastSeenAt)}</p>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <h3>Added</h3>
                    <p>{formatDate(device.createdAt)}</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Device Actions */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={settingsOutline} /> Device Actions
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonButton
                      expand="block"
                      fill="outline"
                      color="danger"
                      onClick={() => setShowResetConfirm(true)}
                      disabled={loading}
                    >
                      <IonIcon icon={trashOutline} slot="start" />
                      Reset Device
                    </IonButton>
                    <IonNote>
                      <small>
                        Removes device from your account. Device will need to be
                        re-paired.
                      </small>
                    </IonNote>
                  </IonCol>
                </IonRow>
              </IonGrid>

              {loading && (
                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <IonSpinner name="crescent" />
                  <p>Resetting device...</p>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={toastState.isOpen}
        message={toastState.message}
        duration={toastState.duration}
        onDidDismiss={hideToast}
        color={toastState.color}
      />

      <IonAlert
        isOpen={showResetConfirm}
        onDidDismiss={() => setShowResetConfirm(false)}
        header="⚠️ Reset Device"
        subHeader={`Reset "${device.name}"?`}
        message={`This will permanently remove the device from your account.

What happens next:
• Device will be removed from your account
• A new pairing code will be generated
• Device can be paired with any account
• You'll need to set it up again to use it

This action cannot be undone.`}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "alert-button-cancel",
          },
          {
            text: "Yes, Reset Device",
            role: "destructive",
            cssClass: "alert-button-confirm",
            handler: handleReset,
          },
        ]}
        cssClass="reset-device-alert"
      />
    </>
  );
};

export default DeviceSettingsModal;
