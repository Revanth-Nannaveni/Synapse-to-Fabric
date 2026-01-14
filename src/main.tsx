import { createRoot } from "react-dom/client";
import { AzureCredentialsProvider } from "@/contexts/AzureCredentialsContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AzureCredentialsProvider>
    <App />
  </AzureCredentialsProvider>
);
