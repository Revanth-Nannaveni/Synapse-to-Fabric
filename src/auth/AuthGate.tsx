import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { inProgress } = useMsal();

  console.log("MSAL inProgress:", inProgress);

  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading authentication… ({inProgress})</p>
      </div>
    );
  }

  return <>{children}</>;
};
