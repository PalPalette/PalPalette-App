import React, { useEffect, useState } from "react";
import { UsersService } from "../services/openapi/services/UsersService";
import type { MessageTimeframeResponseDto } from "../services/openapi/models/MessageTimeframeResponseDto";

// All hooks must be inside the component

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonToggle,
} from "@ionic/react";
import {
  person,
  logOut,
  informationCircle,
  colorPalette,
  code,
} from "ionicons/icons";
import { useAuth } from "../hooks/useContexts";
import { useDeveloperMode } from "../hooks/useDeveloperMode";
import { SessionManager } from "../components/common/SessionManager";
import { TokenStatus } from "../components/common/TokenStatus";

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDeveloperMode, toggleDeveloperMode } = useDeveloperMode();

  // Message timeframe state (must be inside component)
  const [timeframeEnabled, setTimeframeEnabled] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loadingTimeframe, setLoadingTimeframe] = useState(true);
  const [savingTimeframe, setSavingTimeframe] = useState(false);
  const [timeframeError, setTimeframeError] = useState<string | null>(null);
  const [timeframeSuccess, setTimeframeSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoadingTimeframe(true);
    UsersService.usersControllerGetMessageTimeframe()
      .then((res: MessageTimeframeResponseDto) => {
        setTimeframeEnabled(res.isConfigured);
        setStartTime(res.messageStartTime || "");
        setEndTime(res.messageEndTime || "");
        setTimeframeError(null);
      })
      .catch(() => {
        setTimeframeError("Failed to load message timeframe.");
      })
      .finally(() => setLoadingTimeframe(false));
  }, []);

  const handleSaveTimeframe = async () => {
    setSavingTimeframe(true);
    setTimeframeError(null);
    setTimeframeSuccess(null);
    try {
      const dto = timeframeEnabled
        ? { messageStartTime: startTime, messageEndTime: endTime }
        : { messageStartTime: undefined, messageEndTime: undefined };
      await UsersService.usersControllerSetMessageTimeframe(dto);
      setTimeframeSuccess("Timeframe saved successfully.");
    } catch {
      setTimeframeError("Failed to save timeframe.");
    } finally {
      setSavingTimeframe(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* User Info */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Account Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={person} slot="start" />
                <IonLabel>
                  <h2>{user?.displayName}</h2>
                  <p>{user?.email}</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Message Timeframe */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Message Timeframe</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {loadingTimeframe ? (
              <IonText>Loading timeframe...</IonText>
            ) : (
              <>
                <IonList>
                  <IonItem>
                    <IonLabel>Enable Timeframe</IonLabel>
                    <IonToggle
                      checked={timeframeEnabled}
                      onIonChange={(e) => setTimeframeEnabled(e.detail.checked)}
                      slot="end"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Start Time</IonLabel>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={{ width: "100%" }}
                      disabled={!timeframeEnabled}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">End Time</IonLabel>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{ width: "100%" }}
                      disabled={!timeframeEnabled}
                    />
                  </IonItem>
                </IonList>
                {timeframeError && (
                  <IonText color="danger">
                    <p>{timeframeError}</p>
                  </IonText>
                )}
                {timeframeSuccess && (
                  <IonText color="success">
                    <p>{timeframeSuccess}</p>
                  </IonText>
                )}
                <IonButton
                  expand="block"
                  style={{ marginTop: 12 }}
                  onClick={handleSaveTimeframe}
                  disabled={
                    savingTimeframe ||
                    (timeframeEnabled && (!startTime || !endTime))
                  }
                  color="primary"
                >
                  {savingTimeframe ? "Saving..." : "Save Timeframe"}
                </IonButton>
              </>
            )}
          </IonCardContent>
        </IonCard>
        {/* App Info */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>About PalPalette</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={colorPalette} slot="start" />
                <IonLabel>
                  <h2>PalPalette</h2>
                  <p>RGB Device Controller</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={informationCircle} slot="start" />
                <IonLabel>
                  <h2>Version</h2>
                  <p>1.0.0</p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonText color="medium">
              <p style={{ marginTop: "16px" }}>
                Control your ESP32/ESP8266 RGB devices with ease. Set up devices
                using QR codes and send beautiful colors wirelessly.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Developer Mode */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Developer</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={code} slot="start" />
                <IonLabel>
                  <h2>Developer Mode</h2>
                  <p>
                    Show technical details like MAC addresses, host information,
                    session management, and token status monitoring
                  </p>
                </IonLabel>
                <IonToggle
                  checked={isDeveloperMode}
                  onIonChange={toggleDeveloperMode}
                  slot="end"
                />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Developer Mode Features */}
        {isDeveloperMode && (
          <>
            {/* Session Management */}
            <SessionManager />

            {/* Token Status Monitor */}
            <TokenStatus />
          </>
        )}

        {/* Actions */}
        <IonCard>
          <IonCardContent>
            <IonButton
              expand="block"
              fill="outline"
              color="danger"
              onClick={handleLogout}
            >
              <IonIcon icon={logOut} slot="start" />
              Logout
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
