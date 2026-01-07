import { useMsal } from "@azure/msal-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "@/pages/LoginPage";
import { AuthGate } from "../src/auth/AuthGate";

const queryClient = new QueryClient();

const App = () => {
  const { accounts, inProgress } = useMsal();
  const isAuthenticated = accounts.length > 0;

  // Wait for MSAL to finish loading before checking auth
  if (inProgress !== "none") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthGate>
          <BrowserRouter>
            <Routes>
              {/* Login route - redirect if already authenticated */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
                }
              />

              {/* Protected dashboard route */}
              <Route
                path="/"
                element={
                  isAuthenticated ? <Index /> : <Navigate to="/login" replace />
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthGate>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;