import { createRoot } from "react-dom/client";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { AzureCredentialsProvider } from "@/contexts/AzureCredentialsContext";
import App from "./App";
import { msalConfig } from "@/auth/msalConfig";
import "./index.css";

const msalInstance = new PublicClientApplication(msalConfig);

// ✅ Initialize MSAL before rendering
msalInstance.initialize().then(() => {
  // Handle redirect promise to process tokens after login
  msalInstance.handleRedirectPromise().then(() => {
    createRoot(document.getElementById("root")!).render(
      <MsalProvider instance={msalInstance}>
        <AzureCredentialsProvider>
          <App />
        </AzureCredentialsProvider>
      </MsalProvider>
    );
  });
});