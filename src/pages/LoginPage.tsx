import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/auth/msalConfig";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database, Shield, ArrowRight } from "lucide-react";

export function LoginPage() {
  const { instance } = useMsal();
  const handleLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup(loginRequest);

      const account = loginResponse.account;

      if (account) {
        const userProfile = {
          email: account.username, // Azure AD email
          name: account.name, // Display name
          homeAccountId: account.homeAccountId, // Unique user ID
          tenantId: account.tenantId,
        };

        localStorage.setItem("userProfile", JSON.stringify(userProfile));
        // localStorage.setItem("userEmail", account.username);
        // localStorage.setItem("userName", account.name || "");

        console.log("User stored:", userProfile);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* (your background + layout stays the same) */}

      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in with your Azure Active Directory account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="azure"
            size="xl"
            className="w-full"
            onClick={handleLogin}
          >
            <Shield className="w-5 h-5" />
            Login with Azure AD
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
