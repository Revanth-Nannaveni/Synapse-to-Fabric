// import { useState, useMemo } from "react";
// import { AppHeader } from "@/components/AppHeader";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { StatusBadge } from "@/components/StatusBadge";
// import { ConnectFabricModal } from "@/components/modals/ConnectFabricModal";
// import {
//   Database,
//   ArrowRightLeft,
//   Sparkles,
//   MoreVertical,
//   Calendar,
//   User,
//   Cable,
//   Search,
//   X,
//   FileText,
//   Workflow,
//   Zap,
//   FolderOpen,
// } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import type { FabricJob } from "@/types/migration";

// interface FabricJobsHomeProps {
//   onLogout: () => void;
//   onMigrateFromSynapse: () => void;
//   onMigrateFromDatabricks: () => void;
// }

// const mockJobs: FabricJob[] = [
//   {
//     id: "1",
//     name: "Sales Data Pipeline",
//     type: "Pipeline • Silver Layer",
//     workspace: "Default Workspace",
//     lastModified: "2 hours ago",
//     status: "Success",
//   },
//   {
//     id: "2",
//     name: "Customer Segmentation",
//     type: "Notebook • Gold Layer",
//     workspace: "Default Workspace",
//     lastModified: "5 mins ago",
//     status: "Running",
//   },
//   {
//     id: "3",
//     name: "Legacy Inventory Sync",
//     type: "Dataflow • Bronze Layer",
//     workspace: "Default Workspace",
//     lastModified: "1 day ago",
//     status: "Failed",
//   },
//   {
//     id: "4",
//     name: "Product Analytics",
//     type: "Pipeline • Gold Layer",
//     workspace: "Analytics Workspace",
//     lastModified: "3 hours ago",
//     status: "Success",
//   },
//   {
//     id: "5",
//     name: "ETL Job Runner",
//     type: "Job • Bronze Layer",
//     workspace: "Default Workspace",
//     lastModified: "30 mins ago",
//     status: "Running",
//   },
// ];

// export function FabricJobsHome({
//   onLogout,
//   onMigrateFromSynapse,
//   onMigrateFromDatabricks,
// }: FabricJobsHomeProps) {
//   const [showFabricModal, setShowFabricModal] = useState(false);
//   const [isFabricConnected, setIsFabricConnected] = useState(false);
//   const [jobs, setJobs] = useState<FabricJob[]>([]);
  
//   // Filter states
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [typeFilter, setTypeFilter] = useState<string>("all");

//   const handleConnectFabric = () => {
//     setIsFabricConnected(true); 
//     setJobs(mockJobs);
//     setShowFabricModal(false);
//   };

//   // Extract type from the type string (e.g., "Pipeline • Silver Layer" -> "Pipeline")
//   const getJobType = (typeString: string) => {
//     return typeString.split("•")[0].trim();
//   };

//   // Get unique types for filter
//   const uniqueTypes = useMemo(() => {
//     const types = new Set(jobs.map(job => getJobType(job.type)));
//     return Array.from(types);
//   }, [jobs]);

//   // Calculate counts for each type
//   const typeCounts = useMemo(() => {
//     const counts: Record<string, number> = {};
//     jobs.forEach(job => {
//       const type = getJobType(job.type);
//       counts[type] = (counts[type] || 0) + 1;
//     });
//     return counts;
//   }, [jobs]);

//   // Get icon for job type
//   const getTypeIcon = (type: string) => {
//     switch (type.toLowerCase()) {
//       case 'pipeline':
//         return Workflow;
//       case 'notebook':
//         return FileText;
//       case 'dataflow':
//         return Zap;
//       case 'job':
//         return Database;
//       default:
//         return FolderOpen;
//     }
//   };

//   // Filter jobs based on search and filters
//   const filteredJobs = useMemo(() => {
//     return jobs.filter(job => {
//       const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                            job.type.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesStatus = statusFilter === "all" || job.status === statusFilter;
//       const matchesType = typeFilter === "all" || getJobType(job.type) === typeFilter;
      
//       return matchesSearch && matchesStatus && matchesType;
//     });
//   }, [jobs, searchQuery, statusFilter, typeFilter]);

//   const clearFilters = () => {
//     setSearchQuery("");
//     setStatusFilter("all");
//     setTypeFilter("all");
//   };

//   const hasActiveFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all";

//   return (
//     <div className="h-screen flex flex-col bg-background">
//       <AppHeader onLogout={onLogout} userName="Data Eng Team" />

//       <main className="flex-1 px-6 max-w-7xl mx-2 overflow-y-auto animate-fade-in">
//         {/* Page Header */}
//         <div className="mb-1 mt-2">
//           <h1 className="text-2xl font-bold text-foreground mb-1">
//             Fabric Migration Hub
//           </h1>
//           <div className="flex items-center gap-4 text-sm text-muted-foreground">
//             <span className="flex items-center gap-1.5">
//               <User className="w-4 h-4" />
//               Owner: Data Eng Team
//             </span>
//             <span className="flex items-center gap-1.5">
//               <Calendar className="w-4 h-4" />
//               Created: Oct 24, 2023
//             </span>
//             <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
//               ● Active
//             </span>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <Card className="mb-2 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
//           <CardContent className="py-4 flex items-center justify-between">
//             <div>
//               <h3 className="font-semibold text-foreground mb-1">
//                 Quick Actions
//               </h3>
//               <p className="text-sm text-muted-foreground">
//                 Connect your environments to start the migration process.
//               </p>
//             </div>

//             <div className="flex gap-3">
//               {!isFabricConnected && (
//                 <Button
//                   variant="azure-outline"
//                   onClick={() => setShowFabricModal(true)}
//                 >
//                   <Sparkles className="w-4 h-4" />
//                   Connect to Fabric
//                 </Button>
//               )}

//               <Button variant="azure" onClick={onMigrateFromDatabricks}>
//                 <Cable className="w-4 h-4" />
//                 Migrate from Databricks
//               </Button>

//               <Button variant="azure" onClick={onMigrateFromSynapse}>
//                 <ArrowRightLeft className="w-4 h-4" />
//                 Migrate from Synapse
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Fabric Jobs */}
//         <Card className="flex flex-col min-h-[370px]">
//           <CardHeader className="pb-3"> 
//             <div className="flex items-center justify-between mb-3">
//               <div>
//                 <CardTitle className="text-sm">Fabric Jobs</CardTitle>
//                 <CardDescription>
//                   Monitor job status across your Fabric workspaces
//                 </CardDescription>
//               </div>

//               {isFabricConnected && (
//                 <Select defaultValue="default">
//                   <SelectTrigger className="w-48">
//                     <Database className="w-4 h-4 mr-2" />
//                     <SelectValue placeholder="Select Workspace" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="default">Default Workspace</SelectItem>
//                     <SelectItem value="analytics">Analytics Workspace</SelectItem>
//                     <SelectItem value="dev">Development</SelectItem>
//                   </SelectContent>
//                 </Select>
//               )}
//             </div>

//             {/* Type Count Tiles */}
//             {isFabricConnected && Object.keys(typeCounts).length > 0 && (
//               <div className="grid grid-cols-5 gap-3 mb-4">
//                 {/* All Jobs Tile */}
//                 <Card 
//                   className="cursor-pointer hover:bg-accent/50 transition-colors"
//                   onClick={() => setTypeFilter("all")}
//                 >
//                   <CardContent className="p-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-2xl font-bold">{jobs.length}</p>
//                         <p className="text-xs text-muted-foreground mt-1">All </p>
//                       </div>
//                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
//                         typeFilter === "all" ? 'bg-primary/20' : 'bg-muted'
//                       }`}>
//                         <FolderOpen className={`w-5 h-5 ${
//                           typeFilter === "all" ? 'text-primary' : 'text-muted-foreground'
//                         }`} />
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Individual Type Tiles */}
//                 {Object.entries(typeCounts).map(([type, count]) => {
//                   const Icon = getTypeIcon(type);
//                   return (
//                     <Card 
//                       key={type} 
//                       className="cursor-pointer hover:bg-accent/50 transition-colors"
//                       onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
//                     >
//                       <CardContent className="p-4">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-2xl font-bold">{count}</p>
//                             <p className="text-xs text-muted-foreground mt-1">{type}</p>
//                           </div>
//                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
//                             typeFilter === type ? 'bg-primary/20' : 'bg-muted'
//                           }`}>
//                             <Icon className={`w-5 h-5 ${
//                               typeFilter === type ? 'text-primary' : 'text-muted-foreground'
//                             }`} />
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Search and Filters */}
//             {isFabricConnected && (
//               <div className="flex items-center gap-2">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Search jobs..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-9 h-9"
//                   />
//                 </div>

//                 <Select value={statusFilter} onValueChange={setStatusFilter}>
//                   <SelectTrigger className="w-36 h-9">
//                     <SelectValue placeholder="Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Status</SelectItem>
//                     <SelectItem value="Success">Success</SelectItem>
//                     <SelectItem value="Running">Running</SelectItem>
//                     <SelectItem value="Failed">Failed</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Select value={typeFilter} onValueChange={setTypeFilter}>
//                   <SelectTrigger className="w-36 h-9">
//                     <SelectValue placeholder="Type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Types</SelectItem>
//                     {uniqueTypes.map(type => (
//                       <SelectItem key={type} value={type}>{type}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 {hasActiveFilters && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={clearFilters}
//                     className="h-9"
//                   >
//                     <X className="w-4 h-4 mr-1" />
//                     Clear
//                   </Button>
//                 )}
//               </div>
//             )}
//           </CardHeader>

//           {!isFabricConnected ? (
//             <div className="flex-1 flex items-center justify-center text-center">
//               <div>
//                 <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
//                   <Database className="w-8 h-8 text-muted-foreground" />
//                 </div>
//                 <h3 className="font-sm font-semibold mb-2">No Connection</h3>
//                 <p className="text-sm text-muted-foreground mb-4">
//                   Connect to Microsoft Fabric to view your jobs
//                 </p>
//                 <Button variant="azure" onClick={() => setShowFabricModal(true)}>
//                   Connect to Fabric
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="flex-1 overflow-y-auto px-4">
//                 {filteredJobs.length === 0 ? (
//                   <div className="flex items-center justify-center h-full text-center">
//                     <div>
//                       <p className="text-sm text-muted-foreground">
//                         No jobs found matching your filters
//                       </p>
//                       {hasActiveFilters && (
//                         <Button
//                           variant="link"
//                           size="sm"
//                           onClick={clearFilters}
//                           className="mt-2"
//                         >
//                           Clear filters
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 ) : (
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="text-xs py-2 w-[240px]">JOB NAME</TableHead>
//                         <TableHead className="text-xs py-2 w-[120px]">TYPE</TableHead>
//                         <TableHead className="text-xs py-2 w-[110px]">CREATED AT</TableHead>
//                         <TableHead className="text-xs py-2 w-[110px]">LAST RUN</TableHead>
//                         <TableHead className="text-xs py-2 w-[100px]">STATUS</TableHead>
//                         <TableHead className="text-xs py-2 text-right w-[80px]">ACTIONS</TableHead>
//                       </TableRow>
//                     </TableHeader> 

//                     <TableBody>
//                       {filteredJobs.map((job) => (
//                         <TableRow key={job.id} className="hover:bg-muted/50 h-12">
//                           <TableCell>
//                             <div className="flex items-center gap-3">
//                               <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
//                                 <Database className="w-3.5 h-3.5 text-primary" />
//                               </div>
//                               <div>
//                                 <p className="text-sm font-medium leading-tight">
//                                   {job.name}
//                                 </p>
//                                 <p className="text-[11px] text-muted-foreground">
//                                   {job.type.split("•")[1]?.trim() || ""}
//                                 </p>
//                               </div>
//                             </div>
//                           </TableCell>

//                           <TableCell className="text-xs font-medium">
//                             {getJobType(job.type)}
//                           </TableCell>

//                           <TableCell className="text-xs">Oct 24, 2023</TableCell>
//                           <TableCell className="text-xs">{job.lastModified}</TableCell>
//                           <TableCell>
//                             <StatusBadge status={job.status} />
//                           </TableCell>

//                           <TableCell className="text-right">
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button size="icon" variant="ghost">
//                                   <MoreVertical className="w-4 h-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuItem>View Details</DropdownMenuItem>
//                                 <DropdownMenuItem>Run Now</DropdownMenuItem>
//                                 <DropdownMenuItem>View Logs</DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 )}
//               </div>

//               <div className="px-4 py-1 border-t text-xs text-muted-foreground">
//                 Showing {filteredJobs.length} of {jobs.length} jobs
//               </div>
//             </>
//           )}
//         </Card>
//       </main>

//       {/* Modals */}
//       <ConnectFabricModal
//         open={showFabricModal}
//         onClose={() => setShowFabricModal(false)}
//         onConnect={handleConnectFabric}
//       />
//     </div>
//   );
// }

import { useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ConnectFabricModal } from "@/components/modals/ConnectFabricModal";
import {
  Database,
  ArrowRightLeft,
  Sparkles,
  MoreVertical,
  Calendar,
  User,
  Cable,
  Search,
  X,
  FileText,
  Workflow,
  Zap,
  FolderOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { FabricJob, FabricApiResponse, Workspace } from "@/types/migration";

interface FabricJobsHomeProps {
  onLogout: () => void;
  onMigrateFromSynapse: () => void;
  onMigrateFromDatabricks: () => void;
}

export function FabricJobsHome({
  onLogout,
  onMigrateFromSynapse,
  onMigrateFromDatabricks,
}: FabricJobsHomeProps) {
  const [showFabricModal, setShowFabricModal] = useState(false);
  const [isFabricConnected, setIsFabricConnected] = useState(false);
  const [jobs, setJobs] = useState<FabricJob[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("all");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

 // Transform API response to job format
const transformApiResponseToJobs = (apiData: FabricApiResponse): FabricJob[] => {
  const transformedJobs: FabricJob[] = [];
  
  apiData.workspaces.forEach((workspace) => {
    // Transform notebooks
    workspace.notebooks.forEach((notebook) => {
      transformedJobs.push({
        id: notebook.id,
        name: notebook.displayName,
        type: "Notebook",
        workspace: workspace.workspaceName,
        lastModified: "N/A",
        status: "Success",
        workspaceId: workspace.workspaceId,
      });
    });

    // Transform pipelines
    workspace.pipelines.forEach((pipeline) => {
      transformedJobs.push({
        id: pipeline.id,
        name: pipeline.displayName,
        type: "Pipeline",
        workspace: workspace.workspaceName,
        lastModified: "N/A",
        status: "Success",
        workspaceId: workspace.workspaceId,
      });
    });

    // Transform lakehouses
    workspace.lakehouses.forEach((lakehouse) => {
      transformedJobs.push({
        id: lakehouse.id,
        name: lakehouse.displayName,
        type: "Lakehouse",
        workspace: workspace.workspaceName,
        lastModified: "N/A",
        status: "Success",
        workspaceId: workspace.workspaceId,
      });
    });

    // Transform warehouses
    workspace.warehouses.forEach((warehouse) => {
      transformedJobs.push({
        id: warehouse.id,
        name: warehouse.displayName,
        type: "Warehouse",
        workspace: workspace.workspaceName,
        lastModified: "N/A",
        status: "Success",
        workspaceId: warehouse.workspaceId,
      });
    });

    // Transform semantic models
    workspace.semanticModels.forEach((model) => {
      transformedJobs.push({
        id: model.id,
        name: model.displayName,
        type: "Semantic Model",
        workspace: workspace.workspaceName,
        lastModified: "N/A",
        status: "Success",
        workspaceId: model.workspaceId,
      });
    });
  });

  return transformedJobs;
};

  const handleConnectFabric = (apiResponse: FabricApiResponse) => {
    setIsFabricConnected(true);
    setWorkspaces(apiResponse.workspaces);
    const transformedJobs = transformApiResponseToJobs(apiResponse);
    setJobs(transformedJobs);
    setShowFabricModal(false);
  };

  // Extract type from the type string (e.g., "Pipeline • Silver Layer" -> "Pipeline")
  const getJobType = (typeString: string) => {
    return typeString.split("•")[0].trim();
  };

  // Filter jobs by workspace
  const workspaceFilteredJobs = useMemo(() => {
    if (selectedWorkspace === "all") {
      return jobs;
    }
    return jobs.filter(job => job.workspace === selectedWorkspace);
  }, [jobs, selectedWorkspace]);

  // Get unique types for filter
  const uniqueTypes = useMemo(() => {
    const types = new Set(workspaceFilteredJobs.map(job => getJobType(job.type)));
    return Array.from(types);
  }, [workspaceFilteredJobs]);

  // Calculate counts for each type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    workspaceFilteredJobs.forEach(job => {
      const type = getJobType(job.type);
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [workspaceFilteredJobs]);

  // Get icon for job type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pipeline':
        return Workflow;
      case 'notebook':
        return FileText;
      case 'dataflow':
        return Zap;
      case 'lakehouse':
      case 'warehouse':
        return Database;
      case 'semantic model':
        return Database;
      default:
        return FolderOpen;
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    return workspaceFilteredJobs.filter(job => {
      const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      const matchesType = typeFilter === "all" || getJobType(job.type) === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [workspaceFilteredJobs, searchQuery, statusFilter, typeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all";

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader onLogout={onLogout} userName="Data Eng Team" />

      <main className="flex-1 px-6 max-w-7xl mx-2 overflow-y-auto animate-fade-in">
        {/* Page Header */}
        <div className="mb-1 mt-2">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Fabric Migration Hub
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Owner: Data Eng Team
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Created: Oct 24, 2023
            </span>
            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
              ● Active
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-2 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Quick Actions
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect your environments to start the migration process.
              </p>
            </div>

            <div className="flex gap-3">
              {!isFabricConnected && (
                <Button
                  variant="azure-outline"
                  onClick={() => setShowFabricModal(true)}
                >
                  <Sparkles className="w-4 h-4" />
                  Connect to Fabric
                </Button>
              )}

              <Button variant="azure" onClick={onMigrateFromDatabricks}>
                <Cable className="w-4 h-4" />
                Migrate from Databricks
              </Button>

              <Button variant="azure" onClick={onMigrateFromSynapse}>
                <ArrowRightLeft className="w-4 h-4" />
                Migrate from Synapse
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fabric Jobs */}
        <Card className="flex flex-col min-h-[370px]">
          <CardHeader className="pb-3"> 
            <div className="flex items-center justify-between mb-3">
              <div>
                <CardTitle className="text-sm">Fabric Jobs</CardTitle>
                <CardDescription>
                  Monitor job status across your Fabric workspaces
                </CardDescription>
              </div>

              {isFabricConnected && workspaces.length > 0 && (
                <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                  <SelectTrigger className="w-48">
                    <Database className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select Workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workspaces</SelectItem>
                    {workspaces.map((workspace) => (
                      <SelectItem key={workspace.workspaceId} value={workspace.workspaceName}>
                        {workspace.workspaceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Type Count Tiles */}
            {isFabricConnected && Object.keys(typeCounts).length > 0 && (
              <div className="grid grid-cols-5 gap-3 mb-4">
                {/* All Jobs Tile */}
                <Card 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setTypeFilter("all")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{workspaceFilteredJobs.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">All </p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        typeFilter === "all" ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <FolderOpen className={`w-5 h-5 ${
                          typeFilter === "all" ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Type Tiles */}
                {Object.entries(typeCounts).slice(0, 4).map(([type, count]) => {
                  const Icon = getTypeIcon(type);
                  return (
                    <Card 
                      key={type} 
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-xs text-muted-foreground mt-1">{type}</p>
                          </div>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            typeFilter === type ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              typeFilter === type ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Search and Filters */}
            {isFabricConnected && (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Success">Success</SelectItem>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            )}
          </CardHeader>

          {!isFabricConnected ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-sm font-semibold mb-2">No Connection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect to Microsoft Fabric to view your jobs
                </p>
                <Button variant="azure" onClick={() => setShowFabricModal(true)}>
                  Connect to Fabric
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4">
                {filteredJobs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        No jobs found matching your filters
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={clearFilters}
                          className="mt-2"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs py-2 w-[240px]">JOB NAME</TableHead>
                        <TableHead className="text-xs py-2 w-[120px]">TYPE</TableHead>
                        <TableHead className="text-xs py-2 w-[110px]">CREATED AT</TableHead>
                        <TableHead className="text-xs py-2 w-[110px]">LAST RUN</TableHead>
                        <TableHead className="text-xs py-2 w-[100px]">STATUS</TableHead>
                        <TableHead className="text-xs py-2 text-right w-[80px]">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader> 

                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id} className="hover:bg-muted/50 h-12">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                                <Database className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium leading-tight">
                                  {job.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {job.type.split("•")[1]?.trim() || ""}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs font-medium">
                            {getJobType(job.type)}
                          </TableCell>

                          <TableCell className="text-xs">Oct 24, 2023</TableCell>
                          <TableCell className="text-xs">{job.lastModified}</TableCell>
                          <TableCell>
                            <StatusBadge status={job.status} />
                          </TableCell>

                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Run Now</DropdownMenuItem>
                                <DropdownMenuItem>View Logs</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="px-4 py-1 border-t text-xs text-muted-foreground">
                Showing {filteredJobs.length} of {workspaceFilteredJobs.length} jobs
              </div>
            </>
          )}
        </Card>
      </main>

      {/* Modals */}
      <ConnectFabricModal
        open={showFabricModal}
        onClose={() => setShowFabricModal(false)}
        onConnect={handleConnectFabric}
      />
    </div>
  );
}