import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { setupServices } from "./services/setupServices";
import { PushService } from "./services/PushService";
import { httpInterceptor } from "./services/http-interceptor.service";

// Initialize services
setupServices();

// Initialize push listeners early (safe to call multiple times)
try {
  PushService.init();
} catch (e) {
  console.warn("Push service init skipped:", e);
}

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
