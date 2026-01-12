/// <reference types="vite/client" />
VITE_AZURE_CLIENT_ID=046e5da3-ebb2-478a-9a16-5c5f790c26c0
VITE_AZURE_TENANT_ID=0eadb77e-42dc-47f8-bbe3-ec2395e0712c

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_CLIENT_ID: string;
  readonly VITE_AZURE_TENANT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
