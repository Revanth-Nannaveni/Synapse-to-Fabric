export type Status =
  | 'Success'
  | 'Running'
  | 'Failed'
  | 'Ready'
  | 'Deprecated'
  | 'Pending'
  | 'Queued'
  | 'Cancelled'
  | 'Skipped'
  | 'Unknown';

export interface FabricJob {
  id: string;
  name: string;
  type: string;
  workspace: string;
  lastModified: string;
  status: Status;
  description?: string;
  workspaceId: string;
}

export interface Workflow {
  id: string;
  name: string;
  type: string;
  lastModified: string;
  status: Status;
}

export interface SparkPool {
  id: string;
  name: string;
  runtimeVersion: string;
  nodeType: string;
  nodes: number;
  libraries: string;
  status: Status;
}

export interface Notebook {
  id: string;
  name: string;
  language: string;
  lastModified: string;
  dependencies: number;
  status: Status;
}

export interface Pipeline {
  id: string;
  name: string;
  activities: number;
  lastRun: string;
  status: Status;
}

export interface LinkedService {
  id: string;
  name: string;
  type: string;
  status: Status;
}

export interface SynapseConnection {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  subscriptionId?: string; // optional
  resourceGroup?: string;  // optional
  workspaceName: string;
  discoveryScope: {
    sparkPools: boolean;
    notebooks: boolean;
    pipelines: boolean;
    linkedServices: boolean;
  };
}


export interface FabricConnection {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  subscriptionId?: string;
}

export interface MigrationItem {
  id: string;
  name: string;
  type: 'Workflow' | 'Job' | 'SparkPool' | 'Notebook' | 'Pipeline' | 'LinkedService';
  targetWorkspace?: string;
  status: Status;
  lastModified: string;
  errorMessage?: string;

  //optional
  runtimeVersion?: string;
  nodeType?: string;
  nodes?: number;
  language?: string;
  dependencies?: number;
  activities?: number;
}

export interface Workspace {
  id: string;
  name: string;
  capacity: string;
  region: string;
}

// API Response Types for Fabric Connection
export interface FabricNotebook {
  id: string;
  type: string;
  displayName: string;
  description: string;
  workspaceId: string;
}

export interface FabricPipeline {
  id: string;
  type: string;
  displayName: string;
  description: string;
  workspaceId: string;
}

export interface FabricLakehouse {
  id: string;
  type: string;
  displayName: string;
  description: string;
  workspaceId: string;
  properties: {
    oneLakeTablesPath: string;
    oneLakeFilesPath: string;
    sqlEndpointProperties: {
      connectionString: string;
      id: string;
      provisioningStatus: string;
    };
  };
}

export interface FabricWarehouse {
  id: string;
  type: string;
  displayName: string;
  description: string;
  workspaceId: string;
}

export interface FabricSemanticModel {
  id: string;
  type: string;
  displayName: string;
  description: string;
  workspaceId: string;
}

export interface FabricSparkPool {
  id: string;
  type: string;
  name: string;
  nodeFamily: string;
  nodeSize: string;
  autoScale: {
    enabled: boolean;
    minNodeCount: number;
    maxNodeCount: number;
  };
  dynamicExecutorAllocation: {
    enabled: boolean;
    minExecutors?: number;
    maxExecutors?: number;
  };
}

export interface FabricWorkspace {
  workspaceId: string;
  workspaceName: string;
  capacityId: string;
  notebooks: FabricNotebook[];
  pipelines: FabricPipeline[];
  lakehouses: FabricLakehouse[];
  warehouses: FabricWarehouse[];
  semanticModels: FabricSemanticModel[];
  sparkPools: FabricSparkPool[];
}

export interface FabricApiResponse {
  workspaces: FabricWorkspace[];
}