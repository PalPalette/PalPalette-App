import React from "react";

interface GlobalNotificationIndicatorProps {
  className?: string;
}

/**
 * GlobalNotificationIndicator component - currently disabled as WebSocket notifications
 * have been removed. This component can be re-implemented with API polling if needed.
 */
const GlobalNotificationIndicator: React.FC<
  GlobalNotificationIndicatorProps
> = () => {
  // Component disabled - WebSocket notifications removed
  // TODO: Re-implement with API polling if device authentication notifications are needed
  return null;
};

export default GlobalNotificationIndicator;
