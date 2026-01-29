// File: src/contexts/FabricCredentialsContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface FabricCredentials {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

interface FabricCredentialsContextType {
  credentials: FabricCredentials | null;
  apiResponse: any | null;
  setCredentials: (creds: FabricCredentials) => void;
  setApiResponse: (response: any) => void;
  clearCredentials: () => void;
}

const FabricCredentialsContext = createContext<FabricCredentialsContextType | undefined>(undefined);

export function FabricCredentialsProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<FabricCredentials | null>(null);
  const [apiResponse, setApiResponse] = useState<any | null>(null);

  const clearCredentials = () => {
    setCredentials(null);
    setApiResponse(null);
  };

  return (
    <FabricCredentialsContext.Provider value={{ 
      credentials, 
      apiResponse, 
      setCredentials, 
      setApiResponse, 
      clearCredentials 
    }}>
      {children}
    </FabricCredentialsContext.Provider>
  );
}

export function useFabricCredentials() {
  const context = useContext(FabricCredentialsContext);
  if (!context) {
    throw new Error('useFabricCredentials must be used within FabricCredentialsProvider');
  }
  return context;
}