import { useState } from "react";
import { useAzureCredentials } from "@/contexts/AzureCredentialsContext";
import { AppHeader } from "@/components/AppHeader";
import { MigrationSidebar } from "@/components/MigrationSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { SelectTargetModal } from "@/components/modals/SelectTargetModal";
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
  FileText,
  Search,
  Filter,
  Grid,
  AlertTriangle,
  CheckCircle2,
  Database,
  BookOpen,
  GitBranch,
  Link2,
  ArrowRight,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface SparkPool {
  id: string;
  name: string;
  runtimeVersion: string;
  nodeType: string;
  nodes: number;
  libraries: string;
  status: string;
}

interface Notebook {
  id: string;
  name: string;
  language: string;
  lastModified: string;
  dependencies: number;
  status: string;
}

interface Pipeline {
  id: string;
  name: string;
  activities: number;
  lastRun: string;
  status: string;
}

interface LinkedService {
  id: string;
  name: string;
  type: string;
  status: string;
}

type TabType = "sparkPools" | "notebooks" | "pipelines" | "linkedServices";

interface MigrationWorkspaceProps {
  onLogout: () => void;
  onBack: () => void;
  onMigrationComplete: (items: any[]) => void;
  onMigrationUpdate: (updateFn: (prev: any[]) => any[]) => void;
  apiResponse: any;
}

// Helper function to format error messages from API responses
function formatErrorMessage(error: any): string | undefined {
  if (!error) return undefined;
  
  // If error is a string, return it as-is
  if (typeof error === 'string') {
    // Try to parse if it looks like JSON
    try {
      const parsed = JSON.parse(error);
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      return error;
    }
  }
  
  // If error is an object with a message property, extract it
  if (typeof error === 'object' && error.message) {
    return error.message;
  }
  
  // Fallback: stringify the error
  return JSON.stringify(error);
}

export function MigrationWorkspace({ 
  onLogout, 
  onBack, 
  onMigrationComplete,
  onMigrationUpdate,
  apiResponse 
}: MigrationWorkspaceProps) {
  const { credentials } = useAzureCredentials();
  
  // Transform API data
  const transformedData = transformApiResponse(apiResponse);
  
  const [activeTab, setActiveTab] = useState<TabType>("sparkPools");
  const [selectedItems, setSelectedItems] = useState<Record<TabType, string[]>>({
    sparkPools: [],
    notebooks: [],
    pipelines: [],
    linkedServices: [],
  });
  const [showReview, setShowReview] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  const { sparkPools, notebooks, pipelines, linkedServices } = transformedData;

  const stats = {
    total: sparkPools.length + notebooks.length + pipelines.length + linkedServices.length,
    ready: calculateReadyCount(transformedData),
    conflicts: 0,
  };

  // Filter functions
  const filterBySearch = <T extends Record<string, any>>(items: T[]) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      Object.values(item).some(value => 
        value != null && String(value).toLowerCase().includes(query)
      )
    );
  };

  const filterByStatus = <T extends { status: string }>(items: T[]) => {
    if (statusFilter === "all") return items;
    return items.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
  };

  const filterByType = (items: any[], tab: TabType) => {
    if (typeFilter === "all") return items;
    
    switch (tab) {
      case "sparkPools":
        return items.filter(item => item.nodeType === typeFilter);
      case "notebooks":
        return items.filter(item => item.language === typeFilter);
      case "pipelines":
        return items;
      case "linkedServices":
        return items.filter(item => item.type === typeFilter);
      default:
        return items;
    }
  };

  const applyFilters = (items: any[], tab: TabType) => {
    let filtered = filterBySearch(items);
    filtered = filterByStatus(filtered);
    filtered = filterByType(filtered, tab);
    return filtered;
  };

  const filteredSparkPools = applyFilters(sparkPools, "sparkPools");
  const filteredNotebooks = applyFilters(notebooks, "notebooks");
  const filteredPipelines = applyFilters(pipelines, "pipelines");
  const filteredLinkedServices = applyFilters(linkedServices, "linkedServices");

  // Get unique values for filters
  const getUniqueStatuses = () => {
    const allStatuses = new Set<string>();
    [...sparkPools, ...notebooks, ...pipelines, ...linkedServices]
      .forEach(item => allStatuses.add(item.status));
    return Array.from(allStatuses);
  };

  const getUniqueTypes = (tab: TabType) => {
    switch (tab) {
      case "sparkPools":
        return Array.from(new Set(sparkPools.map(p => p.nodeType)));
      case "notebooks":
        return Array.from(new Set(notebooks.map(n => n.language)));
      case "linkedServices":
        return Array.from(new Set(linkedServices.map(l => l.type)));
      default:
        return [];
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

  const getPlaceholderText = () => {
    switch (activeTab) {
      case "sparkPools":
        return "Filter spark pools...";
      case "notebooks":
        return "Filter notebooks...";
      case "pipelines":
        return "Filter pipelines...";
      case "linkedServices":
        return "Filter linked services...";
      default:
        return "Search...";
    }
  };

  const totalSelected =
    selectedItems.sparkPools.length +
    selectedItems.notebooks.length +
    selectedItems.pipelines.length +
    selectedItems.linkedServices.length;

  const getSelectedItemDetails = () => {
    const items: any[] = [];
    selectedItems.sparkPools.forEach((id) => {
      const item = sparkPools.find((p) => p.id === id);
      if (item) items.push({ ...item, type: "SparkPool" });
    });
    selectedItems.notebooks.forEach((id) => {
      const item = notebooks.find((n) => n.id === id);
      if (item) items.push({ ...item, type: "Notebook" });
    });
    selectedItems.pipelines.forEach((id) => {
      const item = pipelines.find((p) => p.id === id);
      if (item) items.push({ ...item, type: "Pipeline" });
    });
    selectedItems.linkedServices.forEach((id) => {
      const item = linkedServices.find((l) => l.id === id);
      if (item) items.push({ ...item, type: "LinkedService" });
    });
    return items;
  };

  const removeFromSelection = (type: string, id: string) => {
    const tabMap: Record<string, TabType> = {
      SparkPool: "sparkPools",
      Notebook: "notebooks",
      Pipeline: "pipelines",
      LinkedService: "linkedServices",
    };
    const tab = tabMap[type];
    if (tab) {
      setSelectedItems((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((i) => i !== id),
      }));
    }
  };

 const handleStartMigration = async (workspace: any) => {
  setIsMigrating(true);
  setMigrationError(null);
  
  try {
    console.log("Starting migration with workspace:", workspace);
    console.log("Using credentials:", credentials);
    
    const selectedDetails = getSelectedItemDetails();
    
    // Step 1: Create initial migration items with "Running" status
    const initialMigrationItems = selectedDetails.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      status: "Running" as const,
      targetWorkspace: workspace.name,
      lastModified: new Date().toISOString(),
      // Include other properties from the original item
      runtimeVersion: item.runtimeVersion,
      nodeType: item.nodeType,
      nodes: item.nodes,
      language: item.language,
      dependencies: item.dependencies,
      activities: item.activities
    }));
    
    // Step 2: Immediately navigate to report with "Running" status
    console.log("Navigating to report with running items:", initialMigrationItems);
    onMigrationComplete(initialMigrationItems);
    
    // Step 3: Prepare base payload
    const basePayload = {
      synapse: {
        tenantId: credentials?.tenantId || "",
        clientId: credentials?.clientId || "",
        clientSecret: credentials?.clientSecret || "",
        workspaceName: apiResponse.workspace || ""
      },
      fabric: {
        tenantId: credentials?.tenantId || "",
        clientId: credentials?.clientId || "",
        clientSecret: credentials?.clientSecret || "",
        workspaceId: workspace.id || ""
      }
    };
    
    console.log("Base payload:", basePayload);
    
    // Step 4: Migrate Spark Pools (one at a time)
    const selectedPools = selectedDetails.filter(item => item.type === "SparkPool");
    for (const pool of selectedPools) {
      console.log("Migrating Spark Pool:", pool.name);
      
      const sparkPoolPayload = {
        ...basePayload,
        selectedPools: [pool.name],
        migrateConfigs: true
      };
      
      console.log("Spark Pool Migration Payload:", JSON.stringify(sparkPoolPayload, null, 2));
      
      try {
        const sparkResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/SparkPoolMigration?code=${import.meta.env.VITE_API_CODE_SPARK_POOL_MIGRATION}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sparkPoolPayload)
          }
        );
        
        const sparkResult = await sparkResponse.json();
        console.log("Spark Pool Migration Response:", sparkResult);
        
        const isSuccess = sparkResult.Success?.includes(pool.name);
        const failedItem = sparkResult.Failed?.find((f: any) => f.name === pool.name);
        
        // Update this specific item in the report
        onMigrationUpdate((prevItems) => 
          prevItems.map(item => 
            item.id === pool.id 
              ? {
                  ...item,
                  status: isSuccess ? "Success" : "Failed",
                  errorMessage: formatErrorMessage(failedItem?.message),
                  lastModified: new Date().toISOString()
                }
              : item
          )
        );
      } catch (error) {
        console.error("Spark Pool Migration Error:", error);
        onMigrationUpdate((prevItems) => 
          prevItems.map(item => 
            item.id === pool.id 
              ? {
                  ...item,
                  status: "Failed",
                  errorMessage: formatErrorMessage(error instanceof Error ? error.message : error),
                  lastModified: new Date().toISOString()
                }
              : item
          )
        );
      }
    }
    
    // Step 5: Migrate Notebooks (one at a time)
    const selectedNotebooks = selectedDetails.filter(item => item.type === "Notebook");
    for (const notebook of selectedNotebooks) {
      console.log("Migrating Notebook:", notebook.name);
      
      const notebookPayload = {
        ...basePayload,
        notebooks: [notebook.name]
      };
      
      console.log("Notebook Migration Payload:", JSON.stringify(notebookPayload, null, 2));
      
      try {
        const notebookResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/NotebooksMigration?code=${import.meta.env.VITE_API_CODE_NOTEBOOKS_MIGRATION}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notebookPayload)
          }
        );
        
        const notebookResult = await notebookResponse.json();
        console.log("Notebook Migration Response:", notebookResult);
        
        const isSuccess = notebookResult.Success?.includes(notebook.name);
        const failedItem = notebookResult.Failed?.find((f: any) => f.name === notebook.name);
        
        onMigrationUpdate((prevItems) => 
          prevItems.map(item => 
            item.id === notebook.id 
              ? {
                  ...item,
                  status: isSuccess ? "Success" : "Failed",
                  errorMessage: formatErrorMessage(failedItem?.message),
                  lastModified: new Date().toISOString()
                }
              : item
          )
        );
      } catch (error) {
        console.error("Notebook Migration Error:", error);
        onMigrationUpdate((prevItems) => 
          prevItems.map(item => 
            item.id === notebook.id 
              ? {
                  ...item,
                  status: "Failed",
                  errorMessage: formatErrorMessage(error instanceof Error ? error.message : error),
                  lastModified: new Date().toISOString()
                }
              : item
          )
        );
      }
    }
    
    // Step 6: Migrate Pipelines (one at a time)
    const selectedPipelines = selectedDetails.filter(item => item.type === "Pipeline");
    for (const pipeline of selectedPipelines) {
      console.log("Migrating Pipeline:", pipeline.name);
      
      const pipelinePayload = {
        ...basePayload,
        pipelines: [pipeline.name]
      };
      
      console.log("Pipeline Migration Payload:", JSON.stringify(pipelinePayload, null, 2));
      
      try {
        const pipelineResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/PipelinesMigration?code=${import.meta.env.VITE_API_CODE_PIPELINES_MIGRATION}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pipelinePayload)
          }
        );
        
        const pipelineResult = await pipelineResponse.json();
        console.log("Pipeline Migration Response:", pipelineResult);
        
        const isSuccess = pipelineResult.Success?.includes(pipeline.name);
        const failedItem = pipelineResult.Failed?.find((f: any) => f.name === pipeline.name);
        
        onMigrationUpdate((prevItems) => 
          prevItems.map(item => 
            item.id === pipeline.id 
              ? {
                  ...item,
                  status: isSuccess ? "Success" : "Failed",
                  errorMessage: formatErrorMessage(failedItem?.message),
                  lastModified: new Date().toISOString()
                }
              : item
          )
        );
      } catch (error) {
        console.error("Pipeline Migration Error:", error);
        onMigrationUpdate((prevItems) => 
          prevItems.map(item => 
            item.id === pipeline.id 
              ? {
                  ...item,
                  status: "Failed",
                  errorMessage: formatErrorMessage(error instanceof Error ? error.message : error),
                  lastModified: new Date().toISOString()
                }
              : item
          )
        );
      }
    }
    
    // Step 7: Handle Linked Services (not implemented)
    const selectedLinkedServices = selectedDetails.filter(item => item.type === "LinkedService");
    for (const service of selectedLinkedServices) {
      console.log("Linked Services migration not yet implemented");
      onMigrationUpdate((prevItems) => 
        prevItems.map(item => 
          item.id === service.id 
            ? {
                ...item,
                status: "Failed",
                errorMessage: "Linked Services migration not yet implemented",
                lastModified: new Date().toISOString()
              }
            : item
        )
      );
    }
    
    console.log("=== ALL MIGRATIONS COMPLETED ===");
    setIsMigrating(false);
    
  } catch (error) {
    console.error("Migration error:", error);
    setMigrationError(error instanceof Error ? error.message : "Unknown error occurred");
    setIsMigrating(false);
  }
};

  if (showReview) {
    const selectedDetails = getSelectedItemDetails();
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
              {selectedItems.sparkPools.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Spark Pools ({selectedItems.sparkPools.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails
                      .filter((i) => i.type === "SparkPool")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.runtimeVersion} • {item.nodeType}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromSelection("SparkPool", item.id)}
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
                            <p className="text-sm text-muted-foreground">{item.language}</p>
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

              {selectedItems.pipelines.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    Pipelines ({selectedItems.pipelines.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails
                      .filter((i) => i.type === "Pipeline")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.activities} activities
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromSelection("Pipeline", item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedItems.linkedServices.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    Linked Services ({selectedItems.linkedServices.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails
                      .filter((i) => i.type === "LinkedService")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.type}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromSelection("LinkedService", item.id)}
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
                  disabled={totalSelected === 0 || isMigrating}
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      Migrate
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
              
              {migrationError && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <strong>Error:</strong> {migrationError}
                </div>
              )}
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
      <MigrationSidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as TabType)} 
        onBack={onBack}
        workspaceName={apiResponse.workspace || "Synapse Workspace"}
      />
      <div className="flex-1">
        <main className="p-6 animate-fade-in">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span>Projects</span>
            <ChevronRight className="w-4 h-4" />
            <span>{apiResponse.workspace}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Discovery Results</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Discovery Results</h1>
              <p className="text-sm text-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Scan completed successfully
              </p>
            </div>
            <div className="flex gap-3">
              {/* <Button variant="outline">
                <FileText className="w-4 h-4" />
                Export Report
              </Button> */}
              <Button
                variant="azure"
                disabled={totalSelected === 0}
                onClick={() => setShowReview(true)}
              >
                Migrate Selected
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Grid className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready to Migrate</p>
                  <p className="text-3xl font-bold text-success">{stats.ready}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conflicts / Errors</p>
                  <p className="text-3xl font-bold text-destructive">{stats.conflicts}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
            <TabsList className="bg-muted/50 mb-4">
              <TabsTrigger value="sparkPools" className="gap-2">
                <Database className="w-4 h-4" />
                Spark Pools
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {sparkPools.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="notebooks" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Notebooks
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {notebooks.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="pipelines" className="gap-2">
                <GitBranch className="w-4 h-4" />
                Pipelines
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {pipelines.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="linkedServices" className="gap-2">
                <Link2 className="w-4 h-4" />
                Linked Services
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {linkedServices.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Search & Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={getPlaceholderText()}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 pr-8 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  {getUniqueStatuses().map(status => (
                    <option key={status} value={status.toLowerCase()}>{status}</option>
                  ))}
                </select>
                <Filter className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>

              {(activeTab === "sparkPools" || activeTab === "notebooks" || activeTab === "linkedServices") && (
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-9 px-3 pr-8 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground appearance-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    {getUniqueTypes(activeTab).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <Filter className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              )}

              {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}

              <div className="ml-auto text-sm text-muted-foreground">
                {totalSelected} selected
              </div>
            </div>

            <TabsContent value="sparkPools">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredSparkPools.length > 0 && filteredSparkPools.every((p) =>
                            selectedItems.sparkPools.includes(p.id)
                          )}
                          onCheckedChange={() => toggleAll("sparkPools", filteredSparkPools)}
                        />
                      </TableHead>
                      <TableHead>POOL NAME</TableHead>
                      <TableHead>RUNTIME VER.</TableHead>
                      <TableHead>NODE TYPE</TableHead>
                      <TableHead>NODES</TableHead>
                      <TableHead>LIBRARIES</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSparkPools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No spark pools found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSparkPools.map((pool) => (
                        <TableRow key={pool.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.sparkPools.includes(pool.id)}
                              onCheckedChange={() => toggleSelection("sparkPools", pool.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <Database className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{pool.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{pool.runtimeVersion}</TableCell>
                          <TableCell>{pool.nodeType}</TableCell>
                          <TableCell>{pool.nodes}</TableCell>
                          <TableCell className="text-primary">{pool.libraries}</TableCell>
                          <TableCell>
                            <StatusBadge status={pool.status} />
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
                          checked={filteredNotebooks.length > 0 && filteredNotebooks.every((n) =>
                            selectedItems.notebooks.includes(n.id)
                          )}
                          onCheckedChange={() => toggleAll("notebooks", filteredNotebooks)}
                        />
                      </TableHead>
                      <TableHead>NOTEBOOK NAME</TableHead>
                      <TableHead>LANGUAGE</TableHead>
                      <TableHead>LAST MODIFIED</TableHead>
                      <TableHead>DEPENDENCIES</TableHead>
                      <TableHead>STATUS</TableHead>
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
                          <TableCell>{notebook.lastModified}</TableCell>
                          <TableCell>{notebook.dependencies}</TableCell>
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

            <TabsContent value="pipelines">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredPipelines.length > 0 && filteredPipelines.every((p) =>
                            selectedItems.pipelines.includes(p.id)
                          )}
                          onCheckedChange={() => toggleAll("pipelines", filteredPipelines)}
                        />
                      </TableHead>
                      <TableHead>PIPELINE NAME</TableHead>
                      <TableHead>ACTIVITIES</TableHead>
                      <TableHead>LAST RUN</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPipelines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No pipelines found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPipelines.map((pipeline) => (
                        <TableRow key={pipeline.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.pipelines.includes(pipeline.id)}
                              onCheckedChange={() => toggleSelection("pipelines", pipeline.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <GitBranch className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{pipeline.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{pipeline.activities}</TableCell>
                          <TableCell>{pipeline.lastRun}</TableCell>
                          <TableCell>
                            <StatusBadge status={pipeline.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="linkedServices">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredLinkedServices.length > 0 && filteredLinkedServices.every((l) =>
                            selectedItems.linkedServices.includes(l.id)
                          )}
                          onCheckedChange={() => toggleAll("linkedServices", filteredLinkedServices)}
                        />
                      </TableHead>
                      <TableHead>SERVICE NAME</TableHead>
                      <TableHead>TYPE</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLinkedServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No linked services found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLinkedServices.map((service) => (
                        <TableRow key={service.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.linkedServices.includes(service.id)}
                              onCheckedChange={() => toggleSelection("linkedServices", service.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <Link2 className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{service.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{service.type}</TableCell>
                          <TableCell>
                            <StatusBadge status={service.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>Rows per page: 10</span>
            <span>
              {activeTab === "sparkPools" && `1-${filteredSparkPools.length} of ${sparkPools.length}`}
              {activeTab === "notebooks" && `1-${filteredNotebooks.length} of ${notebooks.length}`}
              {activeTab === "pipelines" && `1-${filteredPipelines.length} of ${pipelines.length}`}
              {activeTab === "linkedServices" && `1-${filteredLinkedServices.length} of ${linkedServices.length}`}
            </span>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-sm text-muted-foreground border-t">
          © 2023 Migration Tool v3.1.0
        </footer>
      </div>
    </div>
  );
}

// Helper function to transform API response to component format
function transformApiResponse(apiResponse: any) {
  const sparkPools: SparkPool[] = (apiResponse.sparkPools || []).map((pool: any, index: number) => ({
    id: pool.id || `pool-${index}`,
    name: pool.name || `Unnamed Pool ${index + 1}`,
    runtimeVersion: `Spark ${pool.properties?.sparkVersion || 'N/A'}`,
    nodeType: pool.properties?.nodeSizeFamily || 'General Purpose',
    nodes: pool.properties?.nodeCount || 0,
    libraries: 'N/A',
    status: pool.properties?.provisioningState === 'Succeeded' ? 'Ready' : 'Pending',
  }));

  const notebooks: Notebook[] = (apiResponse.notebooks || []).map((notebook: any, index: number) => {
    const language = notebook.properties?.metadata?.language_info?.name || 'python';
    return {
      id: notebook.id || `notebook-${index}`,
      name: notebook.name || `Unnamed Notebook ${index + 1}`,
      language: language.charAt(0).toUpperCase() + language.slice(1),
      lastModified: 'N/A',
      dependencies: 0,
      status: 'Ready',
    };
  });

  const pipelines: Pipeline[] = (apiResponse.pipelines || []).map((pipeline: any, index: number) => ({
    id: pipeline.id || `pipeline-${index}`,
    name: pipeline.name || `Unnamed Pipeline ${index + 1}`,
    activities: pipeline.properties?.activities?.length || 0,
    lastRun: 'N/A',
    status: 'Success',
  }));

  const linkedServices: LinkedService[] = (apiResponse.linkedServices || []).map((service: any, index: number) => ({
    id: service.id || `service-${index}`,
    name: service.name || `Unnamed Service ${index + 1}`,
    type: service.properties?.type || 'Unknown',
    status: 'Ready',
  }));

  return { sparkPools, notebooks, pipelines, linkedServices };
}

function calculateReadyCount(data: any) {
  let count = 0;
  data.sparkPools.forEach((p: any) => p.status === 'Ready' && count++);
  data.notebooks.forEach((n: any) => n.status === 'Ready' && count++);
  data.pipelines.forEach((p: any) => p.status === 'Success' && count++);
  data.linkedServices.forEach((l: any) => l.status === 'Ready' && count++);
  return count;
}