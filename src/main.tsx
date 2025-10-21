import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { setupServices } from "./services/setupServices";
import { httpInterceptor } from "./services/http-interceptor.service";

// Initialize services
setupServices();

// Initialize HTTP interceptor for automatic token refresh
console.log("🚀 Initializing HTTP interceptor...");
void httpInterceptor; // This initializes the interceptor
console.log("✅ HTTP Interceptor initialized");

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
