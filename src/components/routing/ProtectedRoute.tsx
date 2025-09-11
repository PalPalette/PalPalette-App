import React from "react";
import { IonSpinner } from "@ionic/react";
import { useAuth } from "../../hooks/useAuth";
import Login from "../../pages/Login";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

/**
 * ProtectedRoute component that ensures user is authenticated before rendering children
 *
 * @param children - The components to render when authenticated
 * @param fallback - Optional custom component to show when not authenticated (defaults to Login)
 * @param loadingComponent - Optional custom loading component
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  loadingComponent,
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
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

  // Show login or custom fallback if not authenticated
  if (!isAuthenticated) {
    return <>{fallback || <Login />}</>;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};
