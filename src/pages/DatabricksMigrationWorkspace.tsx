import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { SelectTargetModal } from "@/components/modals/SelectTargetModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useDatabricksCredentials } from "@/contexts/DatabricksCredentialsContext";
import type { Status } from "@/types/migration";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  Filter,
  CheckCircle2,
  Database,
  BookOpen,
  Briefcase,
  ArrowRight,
  X,
  ChevronRight,
  ChevronLeft,
  Layers,
  LogOut,
  Server,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFabricCredentials } from "@/contexts/FabricCredentialsContext";
import { ConnectFabricModal } from "@/components/modals/ConnectFabricModal";

interface DatabricksMigrationWorkspaceProps {
  onLogout: () => void;
  onBack: () => void;
  onMigrationComplete: (items: any[]) => void;
  apiResponse: {
    counts: {
      notebooks: number;
      folders: number;
      jobs: number;
      clusters: number;
    };
    notebooks: any[];
    folders: any[];
    jobs: any[];
    clusters: any[];
  };
}

type TabType = "jobs" | "notebooks" | "clusters";

const inventoryItems = [
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "notebooks", label: "Notebooks", icon: BookOpen },
  { id: "clusters", label: "Clusters", icon: Server },
];

export function DatabricksMigrationWorkspace({
  onLogout,
  onBack,
  onMigrationComplete,
  apiResponse
}: DatabricksMigrationWorkspaceProps) {
  const { toast } = useToast();
  const { credentials: databricksCredentials } = useDatabricksCredentials();
  const { credentials: fabricCredentials, setCredentials: setFabricCredentials } = useFabricCredentials();

  const transformedJobs = (apiResponse?.jobs || []).map((job: any, index: number) => ({
    id: job.job_id?.toString() || index.toString(),
    name: job.settings?.name || `Job ${index + 1}`,
    schedule: job.settings?.schedule?.quartz_cron_expression ||
      job.settings?.trigger?.pause_status || "Manual",
    createdBy : job.creator_user_name || "N/A",
    lastRun: job.last_run?.start_time ?
      new Date(job.last_run.start_time).toLocaleString() : "N/A",
    cluster: job.settings?.tasks?.[0]?.existing_cluster_id ||
      job.settings?.job_clusters?.[0]?.new_cluster?.cluster_name ||
      job.settings?.new_cluster?.cluster_name || "N/A",
    status: (job.last_run?.state?.life_cycle_state === "TERMINATED" &&
      job.last_run?.state?.result_state === "SUCCESS") ? "Success" :
      job.last_run?.state?.life_cycle_state === "RUNNING" ? "Running" :
        job.last_run?.state?.result_state === "FAILED" ? "Failed" : "Ready" as Status,
  }));

  const transformedNotebooks = (apiResponse?.notebooks || []).map((notebook: any, index: number) => ({
    id: index.toString(),
    name: notebook.name || notebook.path?.split('/').pop() || `Notebook ${index + 1}`,
    language: notebook.language || "Unknown",
    lastModified: "N/A",
    path: notebook.path || "/",
    status: "Ready" as Status,
  }));

  const transformedClusters = (apiResponse?.clusters || []).map((cluster: any, index: number) => ({
    id: cluster.cluster_id || index.toString(),
    name: cluster.cluster_name || `Cluster ${index + 1}`,
    createdBy: cluster.creator_user_name || "N/A",
    state: cluster.state || "Unknown",
    runtime: cluster.spark_version || "N/A",
    workers: cluster.num_workers !== undefined ? cluster.num_workers.toString() : "N/A",
    status: (cluster.state === "RUNNING" ? "Running" :
      cluster.state === "TERMINATED" ? "Success" :
        cluster.state === "ERROR" ? "Failed" : "Ready") as Status,
  }));

  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [selectedItems, setSelectedItems] = useState<Record<TabType, string[]>>({
    jobs: [],
    notebooks: [],
    clusters: [],
  });
  const [showReview, setShowReview] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showFabricModal, setShowFabricModal] = useState(false);

  const handleFabricConnect = (apiResponse: any) => {
    setShowFabricModal(false);
    setShowReview(true);
  };

  const handleMigrateClick = () => {
    const selectedDetails = getSelectedItemDetails();
    const hasNotebooks = selectedDetails.some(item => item.type === "Notebook");
    const hasJobs = selectedDetails.some(item => item.type === "Job");
    const hasClusters = selectedDetails.some(item => item.type === "Cluster");

    if (!hasNotebooks && !hasJobs && !hasClusters) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to migrate.",
        variant: "destructive",
      });
      return;
    }

    if (!fabricCredentials) {
      setShowFabricModal(true);
    } else {
      setShowReview(true);
    }
  };

  const toggleSelection = (tab: TabType, id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [tab]: prev[tab].includes(id)
        ? prev[tab].filter((i) => i !== id)
        : [...prev[tab], id],
    }));
  };

  const toggleAll = (tab: TabType, items: { id: string }[]) => {
    const allIds = items.map((i) => i.id);
    const allSelected = allIds.every((id) => selectedItems[tab].includes(id));
    setSelectedItems((prev) => ({
      ...prev,
      [tab]: allSelected ? [] : allIds,
    }));
  };

  const filterItems = <T extends Record<string, any>>(items: T[]) => {
    return items.filter((item) => {
      const searchableFields = Object.values(item).join(' ').toLowerCase();
      const matchesSearch = searchableFields.includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredJobs = filterItems(transformedJobs);
  const filteredNotebooks = filterItems(transformedNotebooks);
  const filteredClusters = filterItems(transformedClusters);

  const statusOptions = ["all", "Success", "Running", "Failed", "Ready"];

  const totalSelected =
    selectedItems.jobs.length +
    selectedItems.notebooks.length +
    selectedItems.clusters.length;

  const getSelectedItemDetails = () => {
    const items: any[] = [];
    selectedItems.jobs.forEach((id) => {
      const item = transformedJobs.find((j) => j.id === id);
      if (item) items.push({ ...item, type: "Job", source: "databricks" });
    });
    selectedItems.notebooks.forEach((id) => {
      const item = transformedNotebooks.find((n) => n.id === id);
      if (item) items.push({ ...item, type: "Notebook", source: "databricks" });
    });
    selectedItems.clusters.forEach((id) => {
      const item = transformedClusters.find((c) => c.id === id);
      if (item) items.push({ ...item, type: "Cluster", source: "databricks" });
    });
    return items;
  };

  const removeFromSelection = (type: string, id: string) => {
    const tabMap: Record<string, TabType> = {
      Job: "jobs",
      Notebook: "notebooks",
      Cluster: "clusters",
    };
    const tab = tabMap[type];
    if (tab) {
      setSelectedItems((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((i) => i !== id),
      }));
    }
  };

  // Helper function to migrate notebooks
  const migrateNotebooks = async (workspace: any, notebooks: any[]) => {
    const payload = {
      tenantId: fabricCredentials!.tenantId,
      clientId: fabricCredentials!.clientId,
      clientSecret: fabricCredentials!.clientSecret,
      workspaceId: workspace.id,
      databricksUrl: databricksCredentials!.databricksUrl,
      personalAccessToken: databricksCredentials!.personalAccessToken,
      notebooks: notebooks.map(nb => ({
        name: nb.name,
        path: nb.path
      }))
    };

    console.log("Notebook migration payload:", payload);

    const response = await fetch(
      "https://databrickstofabric-fuhdb8a7dhbebrf5.eastus-01.azurewebsites.net/api/MigrateNotebooks?code=0KjRO6OQdRDSj6_ahlRgYhxO2dGy07eCqqegZMeuFJrzAzFuJcusuA==",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Notebook migration failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Notebook migration result:", result);

    return notebooks.map(item => {
      const detail = result.details.find((d: any) => d.name === item.name);
      
      let status: "Success" | "Failed" | "Running" = "Running";
      let errorMessage: string | undefined = undefined;

      if (detail) {
        if (detail.status === "created") {
          status = "Success";
        } else if (detail.status === "already-exists") {
          status = "Failed";
          errorMessage = "already exists";
        } else if (detail.status === "failed") {
          status = "Failed";
          errorMessage = detail.error || "Migration failed";
        }
      }

      return {
        ...item,
        targetWorkspace: workspace.name,
        status,
        errorMessage,
        migrationStatus: detail?.status || "unknown"
      };
    });
  };

  // Helper function to migrate jobs
  const migrateJobs = async (workspace: any, jobs: any[]) => {
    const payload = {
      tenantId: fabricCredentials!.tenantId,
      clientId: fabricCredentials!.clientId,
      clientSecret: fabricCredentials!.clientSecret,
      workspaceId: workspace.id,
      databricksUrl: databricksCredentials!.databricksUrl,
      personalAccessToken: databricksCredentials!.personalAccessToken,
      jobid: jobs.map(job => job.id)
    };

    console.log("Job migration payload:", payload);

    const response = await fetch(
      "https://databrickstofabric-fuhdb8a7dhbebrf5.eastus-01.azurewebsites.net/api/MigrateJob?code=e7lz1_ZOu--IpJDQY2Clu20N-oXkZQgN5A3GpqGvtsHYAzFuL1d4KQ==",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Job migration failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Job migration result:", result);

    // Process each job based on the API response
    return jobs.map(item => {
      // Check in created array
      const createdDetail = result.created?.find((d: any) => d.job_id === item.id);
      // Check in already_exist array
      const existsDetail = result.already_exist?.find((d: any) => d.job_id === item.id);
      // Check in failed array
      const failedDetail = result.failed?.find((d: any) => d.job_id === item.id);
      
      let status: "Success" | "Failed" | "Running" = "Running";
      let errorMessage: string | undefined = undefined;
      let fabricPipelineId: string | undefined = undefined;

      if (createdDetail) {
        status = "Success";
        fabricPipelineId = createdDetail.fabric_pipeline_id;
      } else if (existsDetail) {
        status = "Failed";
        errorMessage = "already exists";
        fabricPipelineId = existsDetail.fabric_pipeline_id;
      } else if (failedDetail) {
        status = "Failed";
        errorMessage = failedDetail.error || "Migration failed";
      }

      return {
        ...item,
        targetWorkspace: workspace.name,
        status,
        errorMessage,
        fabricPipelineId,
        migrationStatus: createdDetail ? "created" : existsDetail ? "already-exists" : failedDetail ? "failed" : "unknown"
      };
    });
  };

  // Helper function to migrate clusters
  const migrateClusters = async (workspace: any, clusters: any[], capacityId: string) => {
    const payload = {
      databricks: {
        host: databricksCredentials!.databricksUrl,
        pat: databricksCredentials!.personalAccessToken
      },
      fabric: {
        tenantId: fabricCredentials!.tenantId,
        clientId: fabricCredentials!.clientId,
        clientSecret: fabricCredentials!.clientSecret,
        capacityId: capacityId,
        workspaceId: workspace.id
      },
      selectedClusters: clusters.map(cluster => cluster.id)
    };

    console.log("Cluster migration payload:", payload);

    const response = await fetch(
      "https://databrickstofabric-fuhdb8a7dhbebrf5.eastus-01.azurewebsites.net/api/ClusterMigration?code=qgKVGHfeCG_K_LHs0UGkxqhZeou2CoF63d0adXhn9qErAzFu9KBvEQ==",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Cluster migration failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Cluster migration result:", result);

    // Process each cluster based on the API response
    return clusters.map(item => {
      // Check if cluster is in Success array (by name or id)
      const isSuccess = result.Success?.some((name: string) => 
        name === item.name || name === item.id
      );
      
      // Check if cluster is in Failed array
      const failedDetail = result.Failed?.find((f: any) => 
        f.name === item.name || f.name === item.id
      );
      
      let status: "Success" | "Failed" | "Running" = "Running";
      let errorMessage: string | undefined = undefined;

      if (isSuccess) {
        status = "Success";
      } else if (failedDetail) {
        status = "Failed";
        errorMessage = failedDetail.message || "Migration failed";
      }

      return {
        ...item,
        targetWorkspace: workspace.name,
        status,
        errorMessage,
        migrationStatus: isSuccess ? "created" : failedDetail ? "failed" : "unknown"
      };
    });
  };

  const handleStartMigration = async (workspace: any) => {
    const selectedDetails = getSelectedItemDetails();
    const notebooksToMigrate = selectedDetails.filter(item => item.type === "Notebook");
    const jobsToMigrate = selectedDetails.filter(item => item.type === "Job");
    const clustersToMigrate = selectedDetails.filter(item => item.type === "Cluster");

    if (notebooksToMigrate.length === 0 && jobsToMigrate.length === 0 && clustersToMigrate.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to migrate.",
        variant: "destructive",
      });
      return;
    }

    if (!databricksCredentials?.databricksUrl || !databricksCredentials?.personalAccessToken) {
      toast({
        title: "Missing Databricks Credentials",
        description: "Databricks credentials not found. Please reconnect.",
        variant: "destructive",
      });
      return;
    }

    if (!fabricCredentials?.tenantId || !fabricCredentials?.clientId || !fabricCredentials?.clientSecret) {
      toast({
        title: "Missing Fabric Credentials",
        description: "Fabric credentials not found. Please connect to Fabric.",
        variant: "destructive",
      });
      return;
    }

    setIsMigrating(true);
    setShowTargetModal(false);

    // Step 1: Create initial items with "Running" status
    const allItemsToMigrate = [...notebooksToMigrate, ...jobsToMigrate, ...clustersToMigrate];
    const initialMigrationItems = allItemsToMigrate.map(item => ({
      ...item,
      targetWorkspace: workspace.name,
      status: "Running" as const,
    }));

    // Step 2: Navigate to report immediately with "Running" status
    onMigrationComplete(initialMigrationItems);

    // Step 3: Start migrations in parallel
    try {
      const results = await Promise.allSettled([
        // Migrate notebooks if any
        notebooksToMigrate.length > 0 ? migrateNotebooks(workspace, notebooksToMigrate) : Promise.resolve(null),
        // Migrate jobs if any
        jobsToMigrate.length > 0 ? migrateJobs(workspace, jobsToMigrate) : Promise.resolve(null),
        // Migrate clusters if any
        clustersToMigrate.length > 0 ? migrateClusters(workspace, clustersToMigrate, workspace.capacity) : Promise.resolve(null)
      ]);

      const [notebookResult, jobResult, clusterResult] = results;

      // Combine results
      const updatedItems: any[] = [];

      // Process notebook results
      if (notebookResult.status === 'fulfilled' && notebookResult.value) {
        updatedItems.push(...notebookResult.value);
      } else if (notebookResult.status === 'rejected') {
        // All notebooks failed
        updatedItems.push(...notebooksToMigrate.map(item => ({
          ...item,
          targetWorkspace: workspace.name,
          status: "Failed" as const,
          errorMessage: "Notebook migration failed"
        })));
      }

      // Process job results
      if (jobResult.status === 'fulfilled' && jobResult.value) {
        updatedItems.push(...jobResult.value);
      } else if (jobResult.status === 'rejected') {
        // All jobs failed
        updatedItems.push(...jobsToMigrate.map(item => ({
          ...item,
          targetWorkspace: workspace.name,
          status: "Failed" as const,
          errorMessage: "Job migration failed"
        })));
      }

      // Process cluster results
      if (clusterResult.status === 'fulfilled' && clusterResult.value) {
        updatedItems.push(...clusterResult.value);
      } else if (clusterResult.status === 'rejected') {
        // All clusters failed
        updatedItems.push(...clustersToMigrate.map(item => ({
          ...item,
          targetWorkspace: workspace.name,
          status: "Failed" as const,
          errorMessage: "Cluster migration failed"
        })));
      }

      // Step 4: Update the report with final statuses
      onMigrationComplete(updatedItems);

      // Show summary toast
      const successCount = updatedItems.filter(i => i.status === "Success").length;
      const failedCount = updatedItems.filter(i => i.status === "Failed").length;

      toast({
        title: "Migration Complete",
        description: `Successfully migrated: ${successCount}, Failed: ${failedCount}`,
      });

    } catch (error) {
      console.error("Migration error:", error);
      
      // Update all items to Failed status
      const failedItems = allItemsToMigrate.map(item => ({
        ...item,
        targetWorkspace: workspace.name,
        status: "Failed" as const,
        errorMessage: error instanceof Error ? error.message : "An error occurred during migration"
      }));
      
      onMigrationComplete(failedItems);

      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "An error occurred during migration",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const totalAssets = transformedJobs.length + transformedNotebooks.length + transformedClusters.length;

  if (showReview) {
    const selectedDetails = getSelectedItemDetails();
    const hasNotebooks = selectedDetails.some(item => item.type === "Notebook");
    const hasJobs = selectedDetails.some(item => item.type === "Job");
    const hasClusters = selectedDetails.some(item => item.type === "Cluster");

    return (
      <div className="min-h-screen bg-background">
        <main className="p-6 max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => setShowReview(false)} className="hover:text-foreground">
              Discovery Results
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Review Selection</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Review Selected Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasNotebooks && !hasJobs && !hasClusters && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Please select at least one item to migrate.</p>
                </div>
              )}

              {selectedItems.jobs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Jobs ({selectedItems.jobs.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails
                      .filter((i) => i.type === "Job")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.schedule} • {item.cluster}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromSelection("Job", item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedItems.notebooks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Notebooks ({selectedItems.notebooks.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails
                      .filter((i) => i.type === "Notebook")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.language} • {item.path}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromSelection("Notebook", item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedItems.clusters.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    Clusters ({selectedItems.clusters.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails
                      .filter((i) => i.type === "Cluster")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.type} • {item.runtime}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromSelection("Cluster", item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setShowReview(false)}>
                  Back to Selection
                </Button>
                <Button
                  variant="azure"
                  onClick={() => setShowTargetModal(true)}
                  disabled={(!hasNotebooks && !hasJobs && !hasClusters) || isMigrating}
                >
                  {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Migrate
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <SelectTargetModal
          open={showTargetModal}
          onClose={() => setShowTargetModal(false)}
          onConfirm={handleStartMigration}
        />

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 min-h-screen bg-sidebar border-r flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                DB
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Databricks Workspace
              </p>
              <p className="text-xs text-muted-foreground">Admin Access</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 pt-16">
          <ul className="space-y-1">
            <li>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              >
                <Layers className="w-4 h-4" />
                Inventory
              </button>

              <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
                {inventoryItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id as TabType)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                        activeTab === item.id
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1">
        <main className="p-6 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            {/* <span>Home</span>
            <ChevronRight className="w-4 h-4" /> */}
            <span>Databricks Workspace</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Discovery Results</span>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Discovery Results</h1>
              <p className="text-sm text-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Scan completed successfully
              </p>
            </div>
            <Button
              variant="azure"
              disabled={totalSelected === 0 || isMigrating}
              onClick={handleMigrateClick}
            >
              {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
              Migrate Selected ({totalSelected})
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
            <TabsList className="bg-muted/50 mb-4">
              <TabsTrigger value="jobs" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Jobs
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {transformedJobs.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="notebooks" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Notebooks
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {transformedNotebooks.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="clusters" className="gap-2">
                <Server className="w-4 h-4" />
                Clusters
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {transformedClusters.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search across all fields..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                >
                  <Filter className="w-4 h-4" />
                  Status
                  {statusFilter !== "all" && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary rounded text-primary-foreground">
                      1
                    </span>
                  )}
                </Button>
                {showStatusMenu && (
                  <div className="absolute top-full mt-1 right-0 bg-popover border rounded-lg shadow-lg p-1 min-w-[160px] z-10">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowStatusMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors",
                          statusFilter === status && "bg-accent font-medium"
                        )}
                      >
                        {status === "all" ? "All Statuses" : status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
              <div className="ml-auto text-sm text-muted-foreground">
                {totalSelected} selected
              </div>
            </div>

            <TabsContent value="jobs">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredJobs.length > 0 && filteredJobs.every((j) => selectedItems.jobs.includes(j.id))}
                          onCheckedChange={() => toggleAll("jobs", filteredJobs)}
                        />
                      </TableHead>
                      <TableHead>JOB NAME</TableHead>
                      <TableHead>CREATED BY</TableHead>
                      <TableHead>SCHEDULE</TableHead>
                      {/* <TableHead>CLUSTER</TableHead> */}
                      {/* <TableHead>LAST RUN</TableHead> */}
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No jobs found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredJobs.map((job) => (
                        <TableRow key={job.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.jobs.includes(job.id)}
                              onCheckedChange={() => toggleSelection("jobs", job.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <Briefcase className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{job.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{job.createdBy}</TableCell>
                          <TableCell>{job.schedule}</TableCell>
                          {/* <TableCell>{job.cluster}</TableCell>
                          <TableCell>{job.lastRun}</TableCell> */}
                          <TableCell>
                            <StatusBadge status={job.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="notebooks">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredNotebooks.length > 0 && filteredNotebooks.every((n) => selectedItems.notebooks.includes(n.id))}
                          onCheckedChange={() => toggleAll("notebooks", filteredNotebooks)}
                        />
                      </TableHead>
                      <TableHead className="min-w-[200px]">NOTEBOOK NAME</TableHead>
                      <TableHead className="w-[120px]">LANGUAGE</TableHead>
                      <TableHead className="min-w-[250px] max-w-[350px]">PATH</TableHead>
                      {/* <TableHead className="w-[150px]">LAST MODIFIED</TableHead> */}
                      <TableHead className="w-[100px]">STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotebooks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No notebooks found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredNotebooks.map((notebook) => (
                        <TableRow key={notebook.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.notebooks.includes(notebook.id)}
                              onCheckedChange={() => toggleSelection("notebooks", notebook.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <BookOpen className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{notebook.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{notebook.language}</TableCell>
                          <TableCell>
                            <div className="max-w-[350px] break-words whitespace-normal">
                              {notebook.path}
                            </div>
                          </TableCell>
                          {/* <TableCell>{notebook.lastModified}</TableCell> */}
                          <TableCell>
                            <StatusBadge status={notebook.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="clusters">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredClusters.length > 0 && filteredClusters.every((c) => selectedItems.clusters.includes(c.id))}
                          onCheckedChange={() => toggleAll("clusters", filteredClusters)}
                        />
                      </TableHead>
                      <TableHead>CLUSTER NAME</TableHead>
                      <TableHead>CREATED BY</TableHead>
                      <TableHead>RUNTIME</TableHead>
                      <TableHead>WORKERS</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClusters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No clusters found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClusters.map((cluster) => (
                        <TableRow key={cluster.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.clusters.includes(cluster.id)}
                              onCheckedChange={() => toggleSelection("clusters", cluster.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <Server className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{cluster.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{cluster.createdBy}</TableCell>
                          <TableCell>{cluster.runtime}</TableCell>
                          <TableCell>{cluster.workers}</TableCell>
                          <TableCell>
                            <StatusBadge status={cluster.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>Rows per page: 10</span>
            <span>1-{totalAssets} of {totalAssets}</span>
          </div>
        </main>

        <footer className="text-center py-4 text-sm text-muted-foreground border-t">
          © 2024 Migration Tool v3.1.0
        </footer>
      </div>
      <ConnectFabricModal
        open={showFabricModal}
        onClose={() => setShowFabricModal(false)}
        onConnect={handleFabricConnect}
      />
    </div>
  );
}