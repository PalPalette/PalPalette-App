import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initializeApiServices } from "./services/api-initialization.service";

// Initialize API services with token refresh
initializeApiServices().catch((error) => {
  console.error("Failed to initialize API services:", error);
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
