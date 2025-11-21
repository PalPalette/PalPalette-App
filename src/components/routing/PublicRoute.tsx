import React from "react";
import { IonSpinner } from "@ionic/react";
import { useAuth } from "../../hooks/useAuth";
import { Redirect } from "react-router-dom";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * PublicRoute component for login/register pages
 * Redirects authenticated users to the main app
 *
 * @param children - The public components to render (Login, Register, etc.)
 * @param redirectTo - Where to redirect authenticated users (defaults to /devices)
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = "/devices",
}) => {
  const { status } = useAuth();

  // Show loading spinner while auth state is being determined
  if (status === "initializing") {
    return (
      <div
        key="public-route-loading"
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
    );
  }

  // If user is already authenticated, redirect to main app
  if (status === "authenticated") {
    return <Redirect to={redirectTo} />;
  }

  // User is not authenticated, show public content
  return <>{children}</>;
};
