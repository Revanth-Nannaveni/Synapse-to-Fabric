import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { SelectTargetModal } from "@/components/modals/SelectTargetModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  FileText,
  Search,
  Filter,
  Download,
  Grid,
  AlertTriangle,
  CheckCircle2,
  Database,
  BookOpen,
  Briefcase,
  GitBranch,
  ArrowRight,
  X,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Layers,
  FileBarChart,
  Monitor,
  Settings,
  LogOut,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DatabricksMigrationWorkspaceProps {
  onLogout: () => void;
  onBack: () => void;
  onMigrationComplete: (items: any[]) => void;
}

// Mock Databricks data
const mockJobs: {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  cluster: string;
  status: Status;
}[] = [
  {
    id: "1",
    name: "Daily ETL Pipeline",
    schedule: "0 0 * * *",
    lastRun: "2 hours ago",
    cluster: "prod-cluster-01",
    status: "Success",
  },
  {
    id: "2",
    name: "ML Model Training",
    schedule: "0 2 * * 1",
    lastRun: "1 day ago",
    cluster: "ml-cluster",
    status: "Success",
  },
  {
    id: "3",
    name: "Data Validation",
    schedule: "0 */4 * * *",
    lastRun: "30 mins ago",
    cluster: "prod-cluster-01",
    status: "Running",
  },
  {
    id: "4",
    name: "Legacy Report Gen",
    schedule: "Manual",
    lastRun: "7 days ago",
    cluster: "old-cluster",
    status: "Failed",
  },
];

const mockNotebooks: {
  id: string;
  name: string;
  language: string;
  lastModified: string;
  path: string;
  status: Status;
}[] = [
  {
    id: "1",
    name: "Customer_Segmentation",
    language: "Python",
    lastModified: "2 hours ago",
    path: "/Users/data-eng/",
    status: "Ready",
  },
  {
    id: "2",
    name: "Sales_Analysis",
    language: "SQL",
    lastModified: "1 day ago",
    path: "/Shared/",
    status: "Ready",
  },
  {
    id: "3",
    name: "Inventory_Forecasting",
    language: "Scala",
    lastModified: "3 days ago",
    path: "/Users/ml-team/",
    status: "Ready",
  },
  {
    id: "4",
    name: "Legacy_Transform",
    language: "Python",
    lastModified: "30 days ago",
    path: "/Archive/",
    status: "Deprecated",
  },
];

const mockWorkflows: {
  id: string;
  name: string;
  tasks: number;
  schedule: string;
  lastRun: string;
  status: Status;
}[] = [
  {
    id: "1",
    name: "Customer_Data_Pipeline",
    tasks: 5,
    schedule: "Daily at 2:00 AM",
    lastRun: "1 hour ago",
    status: "Success",
  },
  {
    id: "2",
    name: "ML_Training_Workflow",
    tasks: 8,
    schedule: "Weekly on Monday",
    lastRun: "2 days ago",
    status: "Success",
  },
  {
    id: "3",
    name: "Data_Quality_Check",
    tasks: 3,
    schedule: "Every 6 hours",
    lastRun: "4 hours ago",
    status: "Running",
  },
  {
    id: "4",
    name: "Legacy_Batch_Process",
    tasks: 4,
    schedule: "Manual",
    lastRun: "15 days ago",
    status: "Failed",
  },
];

const mockDLTs: {
  id: string;
  name: string;
  type: string;
  tables: number;
  lastUpdate: string;
  status: Status;
}[] = [
  {
    id: "1",
    name: "Customer_360_DLT",
    type: "Continuous",
    tables: 12,
    lastUpdate: "1 hour ago",
    status: "Running",
  },
  {
    id: "2",
    name: "Sales_ETL_DLT",
    type: "Triggered",
    tables: 8,
    lastUpdate: "3 hours ago",
    status: "Success",
  },
  {
    id: "3",
    name: "Marketing_Analytics_DLT",
    type: "Continuous",
    tables: 6,
    lastUpdate: "30 mins ago",
    status: "Success",
  },
  {
    id: "4",
    name: "Legacy_Data_Flow",
    type: "Triggered",
    tables: 4,
    lastUpdate: "10 days ago",
    status: "Failed",
  },
];

type TabType = "jobs" | "notebooks" | "workflows" | "dlts";

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "inventory", label: "Inventory", icon: Layers, active: true },
  { id: "migrationPlan", label: "Migration Plan", icon: FileBarChart },
  { id: "monitor", label: "Monitor", icon: Monitor },
  { id: "settings", label: "Settings", icon: Settings },
];

const inventoryItems = [
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "notebooks", label: "Notebooks", icon: BookOpen },
  { id: "workflows", label: "Workflows", icon: Workflow },
  { id: "dlts", label: "Delta Live Tables", icon: GitBranch },
];

export  function DatabricksMigrationWorkspace({ onLogout, onBack, onMigrationComplete }: DatabricksMigrationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [selectedItems, setSelectedItems] = useState<Record<TabType, string[]>>({
    jobs: [],
    notebooks: [],
    workflows: [],
    dlts: [],
  });
  const [showReview, setShowReview] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

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

  const filterItems = <T extends { name: string; status: Status }>(items: T[]) => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredJobs = filterItems(mockJobs);
  const filteredNotebooks = filterItems(mockNotebooks);
  const filteredWorkflows = filterItems(mockWorkflows);
  const filteredDLTs = filterItems(mockDLTs);

  const statusOptions = ["all", "Success", "Running", "Failed", "Ready", "Deprecated"];

  const totalSelected =
    selectedItems.jobs.length +
    selectedItems.notebooks.length + 
    selectedItems.workflows.length +
    selectedItems.dlts.length;

  const getSelectedItemDetails = () => {
    const items: any[] = [];
    selectedItems.jobs.forEach((id) => {
      const item = mockJobs.find((j) => j.id === id);
      if (item) items.push({ ...item, type: "Job", source: "databricks" });
    });
    selectedItems.notebooks.forEach((id) => {
      const item = mockNotebooks.find((n) => n.id === id);
      if (item) items.push({ ...item, type: "Notebook", source: "databricks" });
    });
    selectedItems.workflows.forEach((id) => {
      const item = mockWorkflows.find((w) => w.id === id);
      if (item) items.push({ ...item, type: "Workflow", source: "databricks" });
    });
    selectedItems.dlts.forEach((id) => {
      const item = mockDLTs.find((p) => p.id === id);
      if (item) items.push({ ...item, type: "DLT", source: "databricks" });
    });
    return items;
  };

  const removeFromSelection = (type: string, id: string) => {
    const tabMap: Record<string, TabType> = {
      Job: "jobs",
      Notebook: "notebooks",
      Workflow: "workflows",
      DLT: "dlts",
    };
    const tab = tabMap[type];
    if (tab) {
      setSelectedItems((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((i) => i !== id),
      }));
    }
  };

  const handleStartMigration = (workspace: any) => {
    const items = getSelectedItemDetails().map((item) => ({
      ...item,
      targetWorkspace: workspace.name,
      status: "Running" as const,
    }));
    onMigrationComplete(items);
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

              {selectedItems.workflows.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-primary" />
                    Workflows ({selectedItems.workflows.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails
                      .filter((i) => i.type === "Workflow")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.tasks} tasks • {item.schedule}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromSelection("Workflow", item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedItems.dlts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    Delta Live Tables ({selectedItems.dlts.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails
                      .filter((i) => i.type === "DLT")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.type} • {item.tables} tables
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromSelection("DLT", item.id)}
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
                  disabled={totalSelected === 0}
                >
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
      {/* Databricks Sidebar */}
      <aside className="w-64 min-h-screen bg-sidebar border-r flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Database className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">MigratePro</span>
          </div>
        </div>

        {/* Workspace Selector */}
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
                Databricks Works...
              </p>
              <p className="text-xs text-muted-foreground">Admin Access</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {}}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    item.id === "inventory"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>

                {/* Sub-items for Inventory */}
                {item.id === "inventory" && (
                  <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
                    {inventoryItems.map((subItem) => (
                      <li key={subItem.id}>
                        <button
                          onClick={() => setActiveTab(subItem.id as TabType)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                            activeTab === subItem.id
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-sidebar-foreground"
                          )}
                        >
                          <subItem.icon className="w-3.5 h-3.5" />
                          {subItem.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1">

        <main className="p-6 animate-fade-in">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span>Projects</span>
            <ChevronRight className="w-4 h-4" />
            <span>Databricks Workspace</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Discovery Results</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Discovery Results</h1>
              <p className="text-sm text-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Scan completed successfully on Dec 18, 2024
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <FileText className="w-4 h-4" />
                Export Report
              </Button>
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
                  <p className="text-3xl font-bold text-foreground">
                    {mockJobs.length + mockNotebooks.length + mockWorkflows.length + mockDLTs.length}
                  </p>
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
                  <p className="text-3xl font-bold text-success">12</p>
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
                  <p className="text-3xl font-bold text-destructive">3</p>
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
              <TabsTrigger value="jobs" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Jobs
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {mockJobs.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="notebooks" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Notebooks
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {mockNotebooks.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="workflows" className="gap-2">
                <Workflow className="w-4 h-4" />
                Workflows
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {mockWorkflows.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="dlts" className="gap-2">
                <GitBranch className="w-4 h-4" />
                Delta Live Tables
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {mockDLTs.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Search & Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
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
                      <TableHead>SCHEDULE</TableHead>
                      <TableHead>CLUSTER</TableHead>
                      <TableHead>LAST RUN</TableHead>
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
                          <TableCell>{job.schedule}</TableCell>
                          <TableCell>{job.cluster}</TableCell>
                          <TableCell>{job.lastRun}</TableCell>
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
                      <TableHead>NOTEBOOK NAME</TableHead>
                      <TableHead>LANGUAGE</TableHead>
                      <TableHead>PATH</TableHead>
                      <TableHead>LAST MODIFIED</TableHead>
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
                          <TableCell>{notebook.path}</TableCell>
                          <TableCell>{notebook.lastModified}</TableCell>
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

            <TabsContent value="workflows">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredWorkflows.length > 0 && filteredWorkflows.every((w) => selectedItems.workflows.includes(w.id))}
                          onCheckedChange={() => toggleAll("workflows", filteredWorkflows)}
                        />
                      </TableHead>
                      <TableHead>WORKFLOW NAME</TableHead>
                      <TableHead>TASKS</TableHead>
                      <TableHead>SCHEDULE</TableHead>
                      <TableHead>LAST RUN</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkflows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No workflows found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWorkflows.map((workflow) => (
                        <TableRow key={workflow.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.workflows.includes(workflow.id)}
                              onCheckedChange={() => toggleSelection("workflows", workflow.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <Workflow className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{workflow.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{workflow.tasks}</TableCell>
                          <TableCell>{workflow.schedule}</TableCell>
                          <TableCell>{workflow.lastRun}</TableCell>
                          <TableCell>
                            <StatusBadge status={workflow.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="dlts">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredDLTs.length > 0 && filteredDLTs.every((p) => selectedItems.dlts.includes(p.id))}
                          onCheckedChange={() => toggleAll("dlts", filteredDLTs)}
                        />
                      </TableHead>
                      <TableHead>DLT PIPELINE NAME</TableHead>
                      <TableHead>TYPE</TableHead>
                      <TableHead>TABLES</TableHead>
                      <TableHead>LAST UPDATE</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDLTs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No Delta Live Tables found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDLTs.map((dlt) => (
                        <TableRow key={dlt.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.dlts.includes(dlt.id)}
                              onCheckedChange={() => toggleSelection("dlts", dlt.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <GitBranch className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{dlt.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{dlt.type}</TableCell>
                          <TableCell>{dlt.tables}</TableCell>
                          <TableCell>{dlt.lastUpdate}</TableCell>
                          <TableCell>
                            <StatusBadge status={dlt.status} />
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
            <span>1-{mockJobs.length + mockNotebooks.length + mockWorkflows.length + mockDLTs.length} of {mockJobs.length + mockNotebooks.length + mockWorkflows.length + mockDLTs.length}</span>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-sm text-muted-foreground border-t">
          © 2024 Migration Tool v3.1.0
        </footer>
      </div>
    </div>
  );
}