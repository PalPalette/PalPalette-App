import React from "react";
import { IonSpinner } from "@ionic/react";
import { Redirect } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * ProtectedRoute component that ensures user is authenticated before rendering children
 *
 * @param children - The components to render when authenticated
 * @param redirectTo - Where to redirect unauthenticated users (defaults to /login)
 * @param loadingComponent - Optional custom loading component
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login",
  loadingComponent,
}) => {
  const { status } = useAuth();

  // Show loading state while initializing authentication
  if (status === "initializing") {
    return (
      loadingComponent || (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <IonSpinner name="crescent" />
          <span>Loading...</span>
        </div>
      )
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    console.log("🚫 User not authenticated - redirecting to login");
    return <Redirect to={redirectTo} />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};
