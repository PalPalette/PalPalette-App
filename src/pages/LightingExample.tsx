import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from "@ionic/react";
import { bulb, settings } from "ionicons/icons";
import {
  LightingConfigModalEnhanced,
  LightingSetupStatus,
} from "../components/lighting";

interface LightingExamplePageProps {
  deviceId: string;
  deviceName: string;
}

const LightingExamplePage: React.FC<LightingExamplePageProps> = ({
  deviceId = "example-device-123",
  deviceName = "Living Room Display",
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showStatusComponent, setShowStatusComponent] = useState(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Enhanced Lighting Setup Examples</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>New Lighting System Features</h2>
        <p>
          The enhanced lighting system now includes real-time status polling,
          better user guidance, and improved setup flow management.
        </p>

        <IonList>
          <IonItem>
            <IonIcon icon={settings} slot="start" />
            <IonLabel>
              <h3>Enhanced Configuration Modal</h3>
              <p>Step-by-step setup with live status monitoring</p>
            </IonLabel>
            <IonButton
              slot="end"
              onClick={() => setShowConfigModal(true)}
              fill="outline"
            >
              Open
            </IonButton>
          </IonItem>

          <IonItem>
            <IonIcon icon={bulb} slot="start" />
            <IonLabel>
              <h3>Real-time Status Component</h3>
              <p>Standalone status monitoring with polling</p>
            </IonLabel>
            <IonButton
              slot="end"
              onClick={() => setShowStatusComponent(!showStatusComponent)}
              fill="outline"
            >
              {showStatusComponent ? "Hide" : "Show"}
            </IonButton>
          </IonItem>
        </IonList>

        {/* Inline Status Component */}
        {showStatusComponent && (
          <div style={{ marginTop: "24px" }}>
            <LightingSetupStatus
              deviceId={deviceId}
              deviceName={deviceName}
              autoStartPolling={true}
              onComplete={() => {
                console.log("Setup marked as complete!");
                setShowStatusComponent(false);
              }}
            />
          </div>
        )}

        {/* Enhanced Configuration Modal */}
        <LightingConfigModalEnhanced
          isOpen={showConfigModal}
          onDidDismiss={() => setShowConfigModal(false)}
          deviceId={deviceId}
          deviceName={deviceName}
          onConfigComplete={() => {
            console.log("Configuration completed!");
            setShowConfigModal(false);
          }}
        />

        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            backgroundColor: "var(--ion-color-light)",
            borderRadius: "8px",
          }}
        >
          <h3>Key Improvements:</h3>
          <ul>
            <li>
              <strong>Real-time Polling:</strong> Automatically polls device
              status every 2-3 seconds
            </li>
            <li>
              <strong>Enhanced Status Information:</strong> Shows configuration
              state, connection status, and last test time
            </li>
            <li>
              <strong>Better User Guidance:</strong> Step-by-step instructions
              based on current status
            </li>
            <li>
              <strong>Authentication Handling:</strong> Guides users through
              system-specific auth steps
            </li>
            <li>
              <strong>Progress Tracking:</strong> Visual progress indicators and
              completion states
            </li>
            <li>
              <strong>Error Recovery:</strong> Clear error messages with
              suggested actions
            </li>
          </ul>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LightingExamplePage;
