import React, { useState, useEffect } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonBadge,
} from "@ionic/react";
import { shield, checkmark, refresh, time, warning } from "ionicons/icons";
import { tokenStatusService, TokenValidationStatus } from "../../services/TokenStatusService";

interface TokenStatusProps {
  className?: string;
}

export const TokenStatus: React.FC<TokenStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<TokenValidationStatus>({
    lastValidation: null,
    isTokenValid: null,
    nextValidation: null,
  });

  useEffect(() => {
    // Subscribe to token status updates
    const unsubscribe = tokenStatusService.addListener((newStatus) => {
      setStatus(newStatus);
    });

    // Cleanup on unmount
    return unsubscribe;
  }, []);

  const getTimeUntilNext = (): string => {
    return tokenStatusService.getTimeUntilNext();
  };

  const getStatusColor = (): "success" | "warning" | "danger" => {
    if (status.isTokenValid === null) return "warning";
    return status.isTokenValid ? "success" : "danger";
  };

  const getStatusText = (): string => {
    if (status.isTokenValid === null) return "Validating...";
    return status.isTokenValid ? "Valid" : "Expired";
  };

  const forceValidation = () => {
    // This would trigger immediate validation
    console.log("🔍 Manual token validation requested");
    // The enhancedApiClient will handle this automatically
  };

  return (
    <IonCard className={className}>
      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={shield} style={{ marginRight: "8px" }} />
          Token Status Monitor
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonItem lines="none">
          <IonIcon icon={checkmark} slot="start" />
          <IonLabel>
            <h3>Token Status</h3>
            <p>Current authentication status</p>
          </IonLabel>
          <IonBadge color={getStatusColor()} slot="end">
            {getStatusText()}
          </IonBadge>
        </IonItem>

        <IonItem lines="none">
          <IonIcon icon={time} slot="start" />
          <IonLabel>
            <h3>Last Validation</h3>
            <p>
              {status.lastValidation ? status.lastValidation.toLocaleTimeString() : "Never"}
            </p>
          </IonLabel>
        </IonItem>

        <IonItem lines="none">
          <IonIcon icon={refresh} slot="start" />
          <IonLabel>
            <h3>Next Validation</h3>
            <p>{getTimeUntilNext()}</p>
          </IonLabel>
        </IonItem>

        <div style={{ marginTop: "1rem" }}>
          <IonText color="medium">
            <p style={{ fontSize: "0.9em", lineHeight: "1.4" }}>
              <IonIcon icon={warning} style={{ marginRight: "4px" }} />
              <strong>How it works:</strong> The app automatically validates
              your login token every 5 minutes. If the token is expired, it will
              try to refresh it automatically. If refresh fails, you'll be
              logged out gracefully instead of getting mysterious errors.
            </p>
          </IonText>
        </div>

        <IonButton
          expand="block"
          fill="outline"
          onClick={forceValidation}
          style={{ marginTop: "1rem" }}
        >
          <IonIcon icon={refresh} slot="start" />
          Test Validation
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default TokenStatus;
