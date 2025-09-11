import React, { useState, useEffect } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonSpinner,
  IonAlert,
  IonText,
} from "@ionic/react";
import {
  phonePortrait,
  desktop,
  laptop,
  tabletPortrait,
  globe,
  trash,
} from "ionicons/icons";
import { enhancedApiClient, Session } from "../../services/enhanced-api-client";

interface SessionManagerProps {
  className?: string;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  className,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [deviceToRevoke, setDeviceToRevoke] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sessionsData = await enhancedApiClient.getActiveSessions();
      setSessions(sessionsData);
    } catch (error: unknown) {
      console.error("Failed to load sessions:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load active sessions";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeDevice = (deviceName: string) => {
    setDeviceToRevoke(deviceName);
    setShowAlert(true);
  };

  const confirmRevokeDevice = async () => {
    if (!deviceToRevoke) return;

    try {
      setRevoking(deviceToRevoke);
      await enhancedApiClient.revokeDeviceAccess(deviceToRevoke);

      // Reload sessions after successful revocation
      await loadSessions();

      setShowAlert(false);
      setDeviceToRevoke(null);
    } catch (error: unknown) {
      console.error("Failed to revoke device access:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to revoke device access";
      setError(errorMessage);
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (deviceName?: string) => {
    if (!deviceName) return globe;

    const name = deviceName.toLowerCase();

    if (name.includes("iphone") || name.includes("android")) {
      return phonePortrait;
    }
    if (name.includes("ipad") || name.includes("tablet")) {
      return tabletPortrait;
    }
    if (name.includes("mac") || name.includes("laptop")) {
      return laptop;
    }
    if (name.includes("pc") || name.includes("desktop")) {
      return desktop;
    }

    return globe;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <IonCard className={className}>
        <IonCardHeader>
          <IonCardTitle>Active Sessions</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <IonSpinner />
            <p>Loading sessions...</p>
          </div>
        </IonCardContent>
      </IonCard>
    );
  }

  if (error) {
    return (
      <IonCard className={className}>
        <IonCardHeader>
          <IonCardTitle>Active Sessions</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
          <IonButton fill="clear" onClick={loadSessions} size="small">
            Retry
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <IonCard className={className}>
        <IonCardHeader>
          <IonCardTitle>Active Sessions</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {sessions.length === 0 ? (
            <IonText color="medium">
              <p>No active sessions found.</p>
            </IonText>
          ) : (
            <IonList>
              {sessions.map((session, index) => (
                <IonItem key={index}>
                  <IonIcon
                    icon={getDeviceIcon(session.deviceName)}
                    slot="start"
                  />
                  <IonLabel>
                    <h2>{session.deviceName || "Unknown Device"}</h2>
                    <p>IP: {session.ipAddress || "Unknown"}</p>
                    <p>Created: {formatDate(session.createdAt)}</p>
                    {session.lastUsedAt && (
                      <p>Last Used: {formatDate(session.lastUsedAt)}</p>
                    )}
                  </IonLabel>
                  <IonButton
                    fill="clear"
                    color="danger"
                    slot="end"
                    onClick={() =>
                      handleRevokeDevice(session.deviceName || "Unknown")
                    }
                    disabled={revoking === session.deviceName}
                  >
                    {revoking === session.deviceName ? (
                      <IonSpinner />
                    ) : (
                      <IonIcon icon={trash} />
                    )}
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          )}
          <IonButton
            fill="clear"
            onClick={loadSessions}
            size="small"
            style={{ marginTop: "1rem" }}
          >
            Refresh Sessions
          </IonButton>
        </IonCardContent>
      </IonCard>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Revoke Device Access"}
        message={`Are you sure you want to revoke access for "${deviceToRevoke}"? This will log out this device immediately.`}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              setShowAlert(false);
              setDeviceToRevoke(null);
            },
          },
          {
            text: "Revoke Access",
            role: "destructive",
            handler: confirmRevokeDevice,
          },
        ]}
      />
    </>
  );
};

export default SessionManager;
