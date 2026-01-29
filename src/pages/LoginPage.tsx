import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Database, Shield, ArrowRight } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();

  console.log('[LoginPage] Rendering login page');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
      
      <div className="mb-8 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Database className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Synapse to Fabric</h1>
        </div>
        <p className="text-muted-foreground">
          Transform your data infrastructure with confidence
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in with your Azure Active Directory account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => {
              console.log('[LoginPage] Login button clicked');
              login();
            }}
          >
            <Shield className="w-5 h-5 mr-2" />
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