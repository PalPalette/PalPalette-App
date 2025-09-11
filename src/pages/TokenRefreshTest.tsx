import React, { useState, useContext } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonBadge,
  IonList,
} from "@ionic/react";
import { AuthContext } from "../contexts/AuthContext";
import { DevicesService } from "../services/openapi/services/DevicesService";
import { enhancedApiClient } from "../services/enhanced-api-client";

const TokenRefreshTest: React.FC = () => {
  const { user, token, refreshToken, isAuthenticated } =
    useContext(AuthContext)!;
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      `${new Date().toLocaleTimeString()}: ${result}`,
      ...prev,
    ]);
  };

  const testDirectApiCall = async () => {
    setLoading(true);
    try {
      addTestResult("🔄 Testing direct API call...");
      const devices = await DevicesService.devicesControllerGetMyDevices();
      addTestResult(
        `✅ Direct API call succeeded - got ${devices?.length || 0} devices`
      );
    } catch (error) {
      addTestResult(
        `❌ Direct API call failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
    setLoading(false);
  };

  const testWrappedApiCall = async () => {
    setLoading(true);
    try {
      addTestResult("🔄 Testing HTTP Interceptor (automatic token refresh)...");
      // This call goes through the HTTP interceptor automatically!
      const devices = await DevicesService.devicesControllerGetMyDevices();
      addTestResult(
        `✅ HTTP Interceptor call succeeded - got ${
          devices?.length || 0
        } devices`
      );
    } catch (error) {
      addTestResult(
        `❌ HTTP Interceptor call failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
    setLoading(false);
  };

  const testTokenRefresh = async () => {
    setLoading(true);
    try {
      addTestResult("🔄 Testing manual token refresh...");
      const newToken = await enhancedApiClient.refreshAccessToken();
      addTestResult(
        `✅ Token refresh succeeded - new token: ${newToken.substring(
          0,
          20
        )}...`
      );
    } catch (error) {
      addTestResult(
        `❌ Token refresh failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Token Refresh Test</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Authentication Required</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                Please log in to test the token refresh functionality.
              </IonText>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Token Refresh Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* User Info */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Authentication Status</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h2>User</h2>
                  <p>
                    {user?.displayName} ({user?.email})
                  </p>
                </IonLabel>
                <IonBadge color="success" slot="end">
                  Authenticated
                </IonBadge>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>Access Token</h2>
                  <p>{token ? `${token.substring(0, 30)}...` : "None"}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>Refresh Token</h2>
                  <p>
                    {refreshToken
                      ? `${refreshToken.substring(0, 30)}...`
                      : "None"}
                  </p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Test Controls */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>API Tests</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton
              expand="block"
              onClick={testDirectApiCall}
              disabled={loading}
              color="primary"
            >
              Test Direct API Call (No Token Refresh)
            </IonButton>
            <IonButton
              expand="block"
              onClick={testWrappedApiCall}
              disabled={loading}
              color="secondary"
            >
              Test HTTP Interceptor (Automatic Token Refresh)
            </IonButton>{" "}
            <IonButton
              expand="block"
              onClick={testTokenRefresh}
              disabled={loading}
              color="tertiary"
            >
              Test Manual Token Refresh
            </IonButton>
            <IonButton
              expand="block"
              fill="clear"
              onClick={clearResults}
              disabled={loading}
            >
              Clear Results
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Test Results */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Test Results</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {testResults.length === 0 ? (
              <IonText color="medium">
                <p>No test results yet. Click a button above to run tests.</p>
              </IonText>
            ) : (
              <IonList>
                {testResults.map((result, index) => (
                  <IonItem key={index}>
                    <IonLabel>
                      <p>{result}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default TokenRefreshTest;
