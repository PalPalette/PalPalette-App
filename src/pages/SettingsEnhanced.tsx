import React, { useState, useContext } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonText,
  IonAlert,
} from "@ionic/react";
import { logOut, person, shield, refresh } from "ionicons/icons";
import { AuthContext } from "../contexts/AuthContext";
import { SessionManager } from "../components/common/SessionManager";

const Settings: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isRefreshingTokens, setIsRefreshingTokens] = useState(false);

  if (!authContext) {
    return (
      <IonPage>
        <IonContent>
          <IonText color="danger">
            <p>Authentication context not available</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  const { user, logout, refreshTokens, loading } = authContext;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRefreshTokens = async () => {
    setIsRefreshingTokens(true);
    try {
      await refreshTokens();
    } catch (error) {
      console.error("Token refresh failed:", error);
    } finally {
      setIsRefreshingTokens(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="8" offsetMd="2">
              {/* Account Information */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={person} style={{ marginRight: "8px" }} />
                    Account Information
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {user ? (
                    <div>
                      <IonItem lines="none">
                        <IonLabel>
                          <h3>Display Name</h3>
                          <p>{user.displayName}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem lines="none">
                        <IonLabel>
                          <h3>Email</h3>
                          <p>{user.email}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem lines="none">
                        <IonLabel>
                          <h3>User ID</h3>
                          <p>{user.id}</p>
                        </IonLabel>
                      </IonItem>
                    </div>
                  ) : (
                    <IonText color="medium">
                      <p>No user information available</p>
                    </IonText>
                  )}
                </IonCardContent>
              </IonCard>

              {/* Security Settings */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={shield} style={{ marginRight: "8px" }} />
                    Security Settings
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="primary"
                    onClick={handleRefreshTokens}
                    disabled={isRefreshingTokens}
                  >
                    {isRefreshingTokens ? (
                      <IonSpinner name="dots" />
                    ) : (
                      <IonIcon icon={refresh} slot="start" />
                    )}
                    {isRefreshingTokens ? "Refreshing..." : "Refresh Tokens"}
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="solid"
                    color="danger"
                    onClick={() => setShowLogoutAlert(true)}
                    disabled={loading}
                    style={{ marginTop: "1rem" }}
                  >
                    <IonIcon icon={logOut} slot="start" />
                    {loading ? "Logging out..." : "Logout"}
                  </IonButton>
                </IonCardContent>
              </IonCard>

              {/* Session Management */}
              <SessionManager />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Logout Confirmation Alert */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header={"Confirm Logout"}
          message={
            "Are you sure you want to log out? You will need to log in again to access your account."
          }
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => setShowLogoutAlert(false),
            },
            {
              text: "Logout",
              role: "destructive",
              handler: handleLogout,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Settings;
