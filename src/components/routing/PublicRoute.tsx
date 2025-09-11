import React from "react";
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
  const { isAuthenticated, loading } = useAuth();

  // Don't redirect while still loading auth state
  if (loading) {
    return <>{children}</>;
  }

  // If user is already authenticated, redirect to main app
  if (isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // User is not authenticated, show public content
  return <>{children}</>;
};
