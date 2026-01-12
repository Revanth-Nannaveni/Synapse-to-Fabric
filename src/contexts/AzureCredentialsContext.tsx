import { createContext, useContext, useState } from 'react';

interface AzureCredentials {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

interface AzureCredentialsContextType {
  credentials: AzureCredentials | null;
  setCredentials: (creds: AzureCredentials) => void;
}

const AzureCredentialsContext = createContext<AzureCredentialsContextType | undefined>(undefined);

export function AzureCredentialsProvider({ children }) {
  const [credentials, setCredentials] = useState<AzureCredentials | null>(null);

  return (
    <AzureCredentialsContext.Provider value={{ credentials, setCredentials }}>
      {children}
    </AzureCredentialsContext.Provider>
  );
}

export function useAzureCredentials() {
  const context = useContext(AzureCredentialsContext);
  if (!context) throw new Error('useAzureCredentials must be used within provider');
  return context;
}