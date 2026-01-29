import { createContext, useContext, useState, ReactNode } from 'react';

interface DatabricksCredentials {
  databricksUrl: string;
  personalAccessToken: string;
}

interface DatabricksCredentialsContextType {
  credentials: DatabricksCredentials | null;
  setCredentials: (creds: DatabricksCredentials) => void;
  clearCredentials: () => void;
}

const DatabricksCredentialsContext = createContext<DatabricksCredentialsContextType | undefined>(undefined);

export function DatabricksCredentialsProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<DatabricksCredentials | null>(null);

  const clearCredentials = () => setCredentials(null);

  return (
    <DatabricksCredentialsContext.Provider value={{ credentials, setCredentials, clearCredentials }}>
      {children}
    </DatabricksCredentialsContext.Provider>
  );
}

export function useDatabricksCredentials() {
  const context = useContext(DatabricksCredentialsContext);
  if (!context) {
    throw new Error('useDatabricksCredentials must be used within DatabricksCredentialsProvider');
  }
  return context;
}