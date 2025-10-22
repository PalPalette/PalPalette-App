import React, { useEffect, useState } from "react";
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
} from "@ionic/react";
import {
  notifications,
  phonePortrait,
  cloudUpload,
  list,
  trash,
  shield,
  checkmarkCircle,
  closeCircle,
} from "ionicons/icons";
import { PushNotifications } from "@capacitor/push-notifications";
import { PushService } from "../../services/PushService";
import { PushNotificationsService } from "../../services/openapi/services/PushNotificationsService";
import type { GetSubscriptionsResponseDto } from "../../services/openapi/models/GetSubscriptionsResponseDto";
import type { PermissionStatus } from "@capacitor/push-notifications";

export const PushDebugCard: React.FC = () => {
  const [platform, setPlatform] = useState<string>("-");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [subs, setSubs] = useState<
    GetSubscriptionsResponseDto["subscriptions"]
  >([]);
  const [message, setMessage] = useState<string | null>(null);
  const [permStatus, setPermStatus] = useState<PermissionStatus | null>(null);

  const refreshTokenFromStorage = async () => {
    const t = await PushService.getStoredToken();
    setToken(t);
  };

  const checkPermissions = async () => {
    try {
      const status = await PushNotifications.checkPermissions();
      setPermStatus(status);
    } catch (e) {
      console.warn("Failed to check push permissions:", e);
    }
  };

  useEffect(() => {
    setPlatform(PushService.getPlatform());
    refreshTokenFromStorage();
    checkPermissions();
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await PushService.register();
      await refreshTokenFromStorage();
      await checkPermissions();
      setMessage("✅ Registered with FCM and stored token");
    } catch (e) {
      setMessage(
        `❌ Register failed: ${e instanceof Error ? e.message : String(e)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await PushService.syncRegistration();
      setMessage("✅ Synced token with backend");
    } catch (e) {
      setMessage(
        `❌ Sync failed: ${e instanceof Error ? e.message : String(e)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSubs = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res =
        await PushNotificationsService.pushControllerGetSubscriptions();
      setSubs(res.subscriptions || []);
      setMessage(`✅ Loaded ${res.subscriptions?.length ?? 0} subscription(s)`);
    } catch (e) {
      setMessage(
        `❌ Load subscriptions failed: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await PushService.unregister({ clearLocal: true });
      await refreshTokenFromStorage();
      setMessage("🧹 Unregistered on backend and cleared local token");
    } catch (e) {
      setMessage(
        `❌ Unregister failed: ${e instanceof Error ? e.message : String(e)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={notifications} style={{ marginRight: 8 }} /> Push Debug
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          <IonItem lines="none">
            <IonIcon icon={phonePortrait} slot="start" />
            <IonLabel>
              <h3>Platform</h3>
              <p>{platform}</p>
            </IonLabel>
            <IonBadge color="medium" slot="end">
              {platform}
            </IonBadge>
          </IonItem>

          <IonItem lines="none">
            <IonIcon icon={shield} slot="start" />
            <IonLabel>
              <h3>Push Permission</h3>
              <p>{permStatus ? permStatus.receive : "Checking..."}</p>
            </IonLabel>
            <IonBadge
              color={
                permStatus?.receive === "granted"
                  ? "success"
                  : permStatus?.receive === "denied"
                  ? "danger"
                  : "warning"
              }
              slot="end"
            >
              <IonIcon
                icon={
                  permStatus?.receive === "granted"
                    ? checkmarkCircle
                    : closeCircle
                }
                style={{ marginRight: 4 }}
              />
              {permStatus?.receive || "..."}
            </IonBadge>
          </IonItem>

          <IonItem lines="none">
            <IonIcon icon={cloudUpload} slot="start" />
            <IonLabel>
              <h3>FCM Token</h3>
              <p style={{ wordBreak: "break-all" }}>
                {token ? token : "No token stored"}
              </p>
            </IonLabel>
          </IonItem>
        </IonList>

        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <IonButton
            onClick={handleRegister}
            disabled={loading}
            color="primary"
            expand="block"
          >
            Register for Push
          </IonButton>
          <IonButton
            onClick={handleSync}
            disabled={loading}
            color="secondary"
            expand="block"
          >
            Sync with Backend
          </IonButton>
          <IonButton
            onClick={handleLoadSubs}
            disabled={loading}
            color="tertiary"
            expand="block"
          >
            <IonIcon icon={list} slot="start" /> List Subscriptions
          </IonButton>
          <IonButton
            onClick={handleUnregister}
            disabled={loading}
            color="danger"
            expand="block"
          >
            <IonIcon icon={trash} slot="start" /> Unregister & Clear
          </IonButton>
        </div>

        {message && (
          <IonText
            color={
              message.startsWith("✅") || message.startsWith("🧹")
                ? "success"
                : "danger"
            }
          >
            <p style={{ marginTop: 12 }}>{message}</p>
          </IonText>
        )}

        {subs.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <IonText color="medium">
              <p>Active Subscriptions:</p>
            </IonText>
            <IonList>
              {subs.map((s) => (
                <IonItem key={s.id} lines="full">
                  <IonLabel>
                    <h3>
                      {s.platform} • {s.id.slice(0, 8)}…
                    </h3>
                    <p>
                      {s.deviceId ? `Device: ${s.deviceId} — ` : ""}
                      Created: {new Date(s.createdAt).toLocaleString()}
                      {s.lastSeenAt
                        ? ` — Last Seen: ${new Date(
                            s.lastSeenAt
                          ).toLocaleString()}`
                        : ""}
                    </p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default PushDebugCard;
