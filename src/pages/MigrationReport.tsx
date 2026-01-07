import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Home,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import type { MigrationItem, Status } from "@/types/migration";

interface MigrationReportProps {
  items: MigrationItem[];
  onLogout: () => void;
  onBackToHome: () => void;
  source?: "synapse" | "databricks"; // New prop to determine source
}

export function MigrationReport({ 
  items: initialItems, 
  onLogout, 
  onBackToHome,
  source = "synapse" // Default to synapse
}: MigrationReportProps) {
  const [items, setItems] = useState<MigrationItem[]>(initialItems);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Define asset types based on source
  const synapseTypes = [
    { value: "SparkPool", label: "Spark Pool" },
    { value: "Notebook", label: "Notebook" },
    { value: "Pipeline", label: "Pipeline" },
    { value: "LinkedService", label: "Linked Service" },
  ];

  const databricksTypes = [
    { value: "Job", label: "Job" },
    { value: "Notebook", label: "Notebook" },
    { value: "Workflow", label: "Workflow" },
    { value: "DLT", label: "Delta Live Table" },
  ];

  // Get the appropriate types based on source
  const assetTypes = source === "databricks" ? databricksTypes : synapseTypes;

  // Simulate migration progress
useEffect(() => {
  const runningItems = items.filter(item => item.status === "Running");
  if (runningItems.length === 0) return;

  const timer = setTimeout(() => {
    setItems(prev =>
      prev.map(item => {
        if (item.status === "Running") {
          const success = Math.random() > 0.2;
          return {
            ...item, // ✅ keep full MigrationItem
            status: success ? "Success" : "Failed",
            errorMessage: success
              ? undefined
              : "Connection timeout during data transfer",
          };
        }
        return item;
      })
    );
  }, 3000);

  return () => clearTimeout(timer);
}, [items]);


  const stats = {
    total: items.length,
    success: items.filter((i: { status: string; }) => i.status === "Success").length,
    running: items.filter((i: { status: string; }) => i.status === "Running").length,
    failed: items.filter((i: { status: string; }) => i.status === "Failed").length,
  };

  const progress = stats.total > 0 ? ((stats.success + stats.failed) / stats.total) * 100 : 0;

  const filteredItems = items.filter((item: { status: any; type: any; name: string; }) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

 const retryFailed = () => {
  setItems(prev =>
    prev.map(item =>
      item.status === "Failed"
        ? {
            ...item, 
            status: "Running",
            errorMessage: undefined,
          }
        : item
    )
  );
};

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onLogout={onLogout} />

      <main className="p-6 max-w-7xl mx-auto animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <button onClick={onBackToHome} className="hover:text-foreground flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            {source === "databricks" ? "Databricks" : "Synapse"} Migration Report
          </span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Migration Report</h1>
            <p className="text-sm text-muted-foreground">
              Track the progress of your {source === "databricks" ? "Databricks" : "Synapse"} to Fabric migration
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={retryFailed} disabled={stats.failed === 0}>
              <RefreshCw className="w-4 h-4" />
              Retry Failed
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button variant="azure" onClick={onBackToHome}>
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Overall Migration Progress</h3>
              <span className="text-sm text-muted-foreground">
                {stats.success + stats.failed} of {stats.total} completed
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">
                  Success: {stats.success}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-running animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  Running: {stats.running}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-sm text-muted-foreground">
                  Failed: {stats.failed}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Succeeded</p>
                <p className="text-2xl font-bold text-success">{stats.success}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-running">{stats.running}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-running/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-running animate-spin" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-9"
              value={searchQuery}
              onChange={(e: { target: { value: any; }; }) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Running">Running</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Types</SelectItem>
              {assetTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Migration Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">ITEM NAME</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>TARGET WORKSPACE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>LAST MODIFIED</TableHead>
                <TableHead>ERROR MESSAGE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
          {filteredItems.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{item.name}</TableCell>

              <TableCell>
                <span className="px-2 py-1 rounded bg-muted text-xs">
                  {assetTypes.find(t => t.value === item.type)?.label ?? item.type}
                </span>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {item.targetWorkspace ?? "-"}
              </TableCell>

              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>

              <TableCell className="text-muted-foreground">
                {item.lastModified}
              </TableCell>

              <TableCell>
                {item.errorMessage ? (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {item.errorMessage}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

          </Table>
        </Card>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items match your filters</p>
          </div>
        )}
      </main>
    </div>
  );
}