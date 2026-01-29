// import { useState } from "react";
// import { useMsal } from "@azure/msal-react";
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";
// import { LoginPage } from "@/pages/LoginPage";
// import { AuthGate } from "../src/auth/AuthGate";
// import { AppHeader } from "@/components/AppHeader";
// import { UserProfileModal } from "@/components/modals/UserProfileModal";
// import { getMsalUser } from "@/auth/msalUser";

// const queryClient = new QueryClient();

// const App = () => {
//   const { accounts, inProgress, instance } = useMsal();
//   const isAuthenticated = accounts.length > 0;
//   const [showProfile, setShowProfile] = useState(false);

//   const user = isAuthenticated ? getMsalUser(instance) : null;

//   // Wait for MSAL to finish loading before checking auth
//   if (inProgress !== "none") {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   const handleLogout = () => {
//     instance.logoutRedirect();
//   };

//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <AuthGate>
//           <BrowserRouter>
//             {isAuthenticated && (
//               <>
//                 <AppHeader 
//                   userName={user?.name || user?.firstName || "User"}
//                   onLogout={handleLogout}
//                   onProfileClick={() => setShowProfile(true)}
//                 />
//                 <UserProfileModal 
//                   open={showProfile}
//                   onOpenChange={setShowProfile}
//                   user={user}
//                 />
//               </>
//             )}
//             <Routes>
//               <Route
//                 path="/login"
//                 element={
//                   isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
//                 }
//               />

//               <Route
//                 path="/"
//                 element={
//                   isAuthenticated ? <Index /> : <Navigate to="/login" replace />
//                 }
//               />

//               <Route path="*" element={<NotFound />} />
//             </Routes>
//           </BrowserRouter>
//         </AuthGate>
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// };

// export default App;

import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { FabricJobsHome } from "./pages/FabricJobsHome"; // Import your component

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  console.log('[AppRoutes] Rendering with auth state:', { isAuthenticated, isLoading, user });

  // Wait for auth to finish loading before checking auth
  if (isLoading) {
    console.log('[AppRoutes] Still loading, showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleLogout = () => {
    console.log('[AppRoutes] Logout triggered');
    logout();
  };

  return (
    <BrowserRouter>
      {isAuthenticated && (
        <>
          <AppHeader 
            userName={user?.name || "User"}
            onLogout={handleLogout}
            onProfileClick={() => {
              console.log('[AppRoutes] Profile clicked');
              setShowProfile(true);
            }}
          />
          {showProfile && (
            <UserProfileModal 
              open={showProfile}
              onOpenChange={setShowProfile}
              user={user}
            />
          )}
        </>
      )}
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <>
                {console.log('[AppRoutes] Redirecting from /login to /fabricjobshome (already authenticated)')}
                <Navigate to="/fabricjobshome" replace />
              </>
            ) : (
              <>
                {console.log('[AppRoutes] Showing LoginPage')}
                <LoginPage />
              </>
            )
          }
        />

        <Route
          path="/fabricjobshome"
          element={
            isAuthenticated ? <Index /> : <Navigate to="/login" replace />
          }
        />


        <Route
          path="/"
          element={
            isAuthenticated ? (
              <>
                {console.log('[AppRoutes] Redirecting to /fabricjobshome from root')}
                <Navigate to="/fabricjobshome" replace />
              </>
            ) : (
              <>
                {console.log('[AppRoutes] Redirecting to /login (not authenticated)')}
                <Navigate to="/login" replace />
              </>
            )
          }
        />

        {/* Keep your Index route if needed */}
        <Route
          path="/index"
          element={
            isAuthenticated ? (
              <>
                {console.log('[AppRoutes] Showing Index page (authenticated)')}
                <Index />
              </>
            ) : (
              <>
                {console.log('[AppRoutes] Redirecting to /login (not authenticated)')}
                <Navigate to="/login" replace />
              </>
            )
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => {
  console.log('[App] Initializing application');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;