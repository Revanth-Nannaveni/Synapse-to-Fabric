// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useAzureCredentials } from "@/contexts/AzureCredentialsContext";
// import type { Workspace } from "@/types/migration";

// interface SelectTargetModalProps {
//   open: boolean;
//   onClose: () => void;
//   onConfirm: (workspace: Workspace) => void;
// }

// interface FabricWorkspace {
//   id: string;
//   displayName: string;
//   description: string;
//   type: string;
//   capacityId?: string;
//   domainId?: string;
// }

// export function SelectTargetModal({ open, onClose, onConfirm }: SelectTargetModalProps) {
//   const [loading, setLoading] = useState(false);
//   const [fetchingWorkspaces, setFetchingWorkspaces] = useState(false);
//   const [mode, setMode] = useState<"existing" | "new">("existing");
//   const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
//   const [fabricWorkspaces, setFabricWorkspaces] = useState<FabricWorkspace[]>([]);
//   const [newWorkspace, setNewWorkspace] = useState({
//     name: "",
//     capacity: "",
//     region: "",
//   });
//   const { toast } = useToast();
//   const { credentials } = useAzureCredentials();

//   // Fetch workspaces when modal opens
//   useEffect(() => {
//     if (open && credentials) {
//       fetchFabricWorkspaces();
//     }
//   }, [open, credentials]);

//   const fetchFabricWorkspaces = async () => {
//     if (!credentials) {
//       toast({
//         title: "Missing Credentials",
//         description: "Azure credentials not found. Please connect to Synapse first.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setFetchingWorkspaces(true);

//     try {
//       const response = await fetch(
//          `${import.meta.env.VITE_API_BASE_URL}/ListFabricWorkspaces?code=${import.meta.env.VITE_API_CODE_LIST_FABRIC_WORKSPACES}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Accept": "application/json",
//           },
//           body: JSON.stringify({
//             tenantId: credentials.tenantId,
//             clientId: credentials.clientId,
//             clientSecret: credentials.clientSecret,
//           }),
//         }
//       );

//       console.log("Fabric Workspaces Response status:", response.status);

//       const responseText = await response.text();
//       console.log("Raw response:", responseText);

//       let result;
//       try {
//         result = JSON.parse(responseText);
//       } catch (parseError) {
//         console.error("Failed to parse response as JSON:", parseError);
//         throw new Error("Invalid JSON response from server");
//       }

//       console.log("Parsed Fabric Workspaces:", result);

//       if (response.ok && result.workspaces) {
//         setFabricWorkspaces(result.workspaces);
//         toast({
//           title: "Workspaces Loaded",
//           description: `Found ${result.workspaces.length} Fabric workspace(s).`,
//         });
//       } else {
//         toast({
//           title: "Failed to Load Workspaces",
//           description: result.message || "Could not retrieve Fabric workspaces.",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching Fabric workspaces:", error);
//       toast({
//         title: "Error Loading Workspaces",
//         description: error instanceof Error ? error.message : "An error occurred while fetching workspaces.",
//         variant: "destructive",
//       });
//     } finally {
//       setFetchingWorkspaces(false);
//     }
//   };

//   const handleConfirm = async () => {
//     if (mode === "existing" && !selectedWorkspace) {
//       toast({
//         title: "No Workspace Selected",
//         description: "Please select a target workspace.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (mode === "new" && (!newWorkspace.name || !newWorkspace.capacity || !newWorkspace.region)) {
//       toast({
//         title: "Missing Fields",
//         description: "Please fill in all fields for the new workspace.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setLoading(true);
//     await new Promise((resolve) => setTimeout(resolve, 1500));
//     setLoading(false);

//     const workspace =
//       mode === "existing"
//         ? {
//             id: selectedWorkspace,
//             name: fabricWorkspaces.find((w) => w.id === selectedWorkspace)?.displayName || "",
//             capacity: fabricWorkspaces.find((w) => w.id === selectedWorkspace)?.capacityId || "N/A",
//             region: "N/A", // API doesn't provide region info
//           }
//         : { id: "new", ...newWorkspace };

//     toast({
//       title: "Migration Started",
//       description: `Migrating to ${workspace.name}...`,
//     });

//     onConfirm(workspace);
//     onClose();
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md bg-card">
//         <DialogHeader>
//           <DialogTitle>Select Target Workspace</DialogTitle>
//           <DialogDescription>
//             Choose where to migrate your selected assets.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6 py-4">
//           <RadioGroup value={mode} onValueChange={(v) => setMode(v as "existing" | "new")}>
//             <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
//               <RadioGroupItem value="existing" id="existing" />
//               <Label htmlFor="existing" className="flex-1 cursor-pointer">
//                 <span className="font-medium">Use Existing Workspace</span>
//                 <p className="text-sm text-muted-foreground">
//                   Migrate to an existing Fabric workspace
//                 </p>
//               </Label>
//             </div>

//             <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
//               <RadioGroupItem value="new" id="new" />
//               <Label htmlFor="new" className="flex-1 cursor-pointer">
//                 <span className="font-medium">Create New Workspace</span>
//                 <p className="text-sm text-muted-foreground">
//                   Create a new Fabric workspace for migration
//                 </p>
//               </Label>
//             </div>
//           </RadioGroup>

//           {mode === "existing" ? (
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label>Select Workspace</Label>
//                 {fetchingWorkspaces && (
//                   <span className="text-xs text-muted-foreground flex items-center gap-1">
//                     <Loader2 className="w-3 h-3 animate-spin" />
//                     Loading...
//                   </span>
//                 )}
//               </div>
              
//               {!fetchingWorkspaces && fabricWorkspaces.length === 0 && (
//                 <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
//                   <AlertCircle className="w-4 h-4" />
//                   No workspaces found. Please check your credentials.
//                 </div>
//               )}

//               {fabricWorkspaces.length > 0 && (
//                 <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Choose a workspace" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-popover">
//                     {fabricWorkspaces.map((ws) => (
//                       <SelectItem key={ws.id} value={ws.id}>
//                         <div className="flex flex-col">
//                           <span>{ws.displayName}</span>
//                           <span className="text-xs text-muted-foreground">
//                             {ws.type}
//                             {ws.capacityId && ` • Capacity: ${ws.capacityId.substring(0, 8)}...`}
//                           </span>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="wsName">Workspace Name</Label>
//                 <Input
//                   id="wsName"
//                   placeholder="Enter workspace name"
//                   value={newWorkspace.name}
//                   onChange={(e) =>
//                     setNewWorkspace({ ...newWorkspace, name: e.target.value })
//                   }
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Capacity</Label>
//                   <Select
//                     value={newWorkspace.capacity}
//                     onValueChange={(v) =>
//                       setNewWorkspace({ ...newWorkspace, capacity: v })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select capacity" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-popover">
//                       <SelectItem value="P1">P1</SelectItem>
//                       <SelectItem value="P2">P2</SelectItem>
//                       <SelectItem value="P3">P3</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Region</Label>
//                   <Select
//                     value={newWorkspace.region}
//                     onValueChange={(v) =>
//                       setNewWorkspace({ ...newWorkspace, region: v })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select region" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-popover">
//                       <SelectItem value="East US">East US</SelectItem>
//                       <SelectItem value="West US">West US</SelectItem>
//                       <SelectItem value="North Europe">North Europe</SelectItem>
//                       <SelectItem value="West Europe">West Europe</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end gap-3">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button variant="azure" onClick={handleConfirm} disabled={loading || fetchingWorkspaces}>
//             {loading && <Loader2 className="w-4 h-4 animate-spin" />}
//             Connect & Start Migration
//             <ArrowRight className="w-4 h-4" />
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAzureCredentials } from "@/contexts/AzureCredentialsContext";
import type { Workspace } from "@/types/migration";
import debounce from "lodash/debounce"; // Install lodash if not already: npm install lodash

interface SelectTargetModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (workspace: Workspace) => void;
}

interface FabricWorkspace {
  id: string;
  displayName: string;
  description: string;
  type: string;
  capacityId?: string;
  domainId?: string;
}

interface Capacity {
  capacityId: string;
  capacityName: string;
  sku: string;
  region: string;
  state: string;
}

interface CreateWorkspaceResponse {
  workspaceId: string;
  workspaceName: string;
  status: "created" | "already-exists";
  capacityId?: string;
  region?: string | null;
  admin: string;
}

export function SelectTargetModal({ open, onClose, onConfirm }: SelectTargetModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingWorkspaces, setFetchingWorkspaces] = useState(false);
  const [fetchingCapacities, setFetchingCapacities] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [fabricWorkspaces, setFabricWorkspaces] = useState<FabricWorkspace[]>([]);
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    capacityId: "",
    region: "",
  });
  const [workspaceStatusMessage, setWorkspaceStatusMessage] = useState<string | null>(null);
  const [workspaceStatusType, setWorkspaceStatusType] = useState<"success" | "warning" | null>(null);

  // Real-time name availability state
  const [nameAvailability, setNameAvailability] = useState<{
    status: "idle" | "checking" | "available" | "taken";
    message?: string;
  }>({ status: "idle" });

  const { toast } = useToast();
  const { credentials } = useAzureCredentials();

  // Fetch workspaces when modal opens or after creation
  useEffect(() => {
    if (open && credentials) {
      if (mode === "existing" || (mode === "new" && workspaceStatusType === "success")) {
        fetchFabricWorkspaces();
      }
    }
  }, [open, credentials, mode, workspaceStatusType]);

  // Fetch capacities when switching to "new" mode
  useEffect(() => {
    if (open && credentials && mode === "new") {
      fetchCapacities();
    }
  }, [open, credentials, mode]);

  // Real-time workspace name availability check
  const checkWorkspaceName = useCallback(
    debounce(async (name: string) => {
      if (name.trim().length < 3) {
        setNameAvailability({ status: "idle" });
        return;
      }

      if (!credentials) {
        setNameAvailability({ status: "idle" });
        return;
      }

      setNameAvailability({ status: "checking" });

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/ListFabricWorkspaces?code=${import.meta.env.VITE_API_CODE_LIST_FABRIC_WORKSPACES}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId: credentials.tenantId,
              clientId: credentials.clientId,
              clientSecret: credentials.clientSecret,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to check workspaces");

        const data = await response.json();
        const workspaces: FabricWorkspace[] = data.workspaces || [];

        const exists = workspaces.some(
          (ws: FabricWorkspace) =>
            ws.displayName.trim().toLowerCase() === name.trim().toLowerCase()
        );

        setNameAvailability({
          status: exists ? "taken" : "available",
          message: exists ? "Workspace name already exists" : "Name is available",
        });
      } catch (err) {
        console.warn("Name availability check failed:", err);
        setNameAvailability({
          status: "idle",
          message: "Could not check availability",
        });
      }
    }, 500),
    [credentials]
  );

  // Cleanup debounce
  useEffect(() => {
    return () => {
      checkWorkspaceName.cancel();
    };
  }, [checkWorkspaceName]);

  const fetchFabricWorkspaces = async () => {
    if (!credentials) return;
    setFetchingWorkspaces(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/ListFabricWorkspaces?code=${import.meta.env.VITE_API_CODE_LIST_FABRIC_WORKSPACES}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId: credentials.tenantId,
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret,
          }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.workspaces && Array.isArray(data.workspaces)) {
        setFabricWorkspaces(data.workspaces);
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not load workspaces.", variant: "destructive" });
    } finally {
      setFetchingWorkspaces(false);
    }
  };

  const fetchCapacities = async () => {
    if (!credentials) return;
    setFetchingCapacities(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/ListCapacities?code=${import.meta.env.VITE_API_CODE_LIST_CAPACITIES}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId: credentials.tenantId,
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret,
          }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.capacities && Array.isArray(data.capacities)) {
        const active = data.capacities.filter((c: Capacity) => c.state === "Active");
        setCapacities(active);
        if (active.length > 0 && !newWorkspace.capacityId) {
          setNewWorkspace((prev) => ({
            ...prev,
            capacityId: active[0].capacityId,
            region: active[0].region,
          }));
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not load capacities.", variant: "destructive" });
    } finally {
      setFetchingCapacities(false);
    }
  };

  const createOrGetWorkspace = async (): Promise<Workspace> => {
    const userProfileStr = localStorage.getItem("userProfile");
    let requestingUserEmail = "";
    if (userProfileStr) {
      try {
        const profile = JSON.parse(userProfileStr);
        requestingUserEmail = profile.email || "";
      } catch {}
    }
    if (!requestingUserEmail) throw new Error("User email not found");

    if (!credentials) throw new Error("Azure credentials missing");

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/CreateFabricWorkspace?code=${import.meta.env.VITE_API_CODE_CREATE_FABRIC_WORKSPACES}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: credentials.tenantId,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          workspaceName: newWorkspace.name.trim(),
          capacityId: newWorkspace.capacityId,
          region: newWorkspace.region,
          requestingUserEmail,
        }),
      }
    );

    if (!response.ok) throw new Error(`Workspace API failed: ${response.status}`);

    const result: CreateWorkspaceResponse = await response.json();

    const workspace: Workspace = {
      id: result.workspaceId,
      name: result.workspaceName,
      capacity: result.capacityId || newWorkspace.capacityId || "N/A",
      region: result.region || newWorkspace.region || "N/A",
    };

    if (result.status === "already-exists") {
      setWorkspaceStatusMessage("Workspace already exists. Using existing workspace.");
      setWorkspaceStatusType("warning");
    } else if (result.status === "created") {
      setWorkspaceStatusMessage("New workspace created successfully.");
      setWorkspaceStatusType("success");
    }

    return workspace;
  };

  const handleConfirm = async () => {
    setWorkspaceStatusMessage(null);
    setWorkspaceStatusType(null);

    if (mode === "existing") {
      if (!selectedWorkspace) {
        toast({ title: "No workspace selected", variant: "destructive" });
        return;
      }
      const ws = fabricWorkspaces.find((w) => w.id === selectedWorkspace);
      if (!ws) return;
      const workspace: Workspace = {
        id: ws.id,
        name: ws.displayName,
        capacity: ws.capacityId || "N/A",
        region: "N/A",
      };
      setLoading(true);
      await new Promise((r) => setTimeout(r, 700));
      setLoading(false);
      onConfirm(workspace);
      onClose();
      return;
    }

    // New workspace mode
    if (!newWorkspace.name.trim()) {
      toast({ title: "Workspace name required", variant: "destructive" });
      return;
    }
    if (!newWorkspace.capacityId) {
      toast({ title: "Please select a capacity", variant: "destructive" });
      return;
    }
    if (nameAvailability.status === "taken") {
      toast({ title: "Name already in use", description: "Please choose a different name.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const workspace = await createOrGetWorkspace();
      toast({
        title: workspaceStatusType === "success" ? "Workspace Ready" : "Using Existing",
        description:
          workspaceStatusType === "success"
            ? `Created "${workspace.name}"`
            : `"${workspace.name}" already exists — proceeding`,
      });
      onConfirm(workspace);
      onClose();
    } catch (err: any) {
      toast({
        title: "Operation failed",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Select Target Workspace</DialogTitle>
          <DialogDescription>
            Choose where to migrate your selected assets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={mode} onValueChange={(v) => {
            setMode(v as "existing" | "new");
            setWorkspaceStatusMessage(null);
            setWorkspaceStatusType(null);
            setNameAvailability({ status: "idle" });
          }}>
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing" className="flex-1 cursor-pointer">
                <span className="font-medium">Use Existing Workspace</span>
                <p className="text-sm text-muted-foreground">
                  Migrate to an existing Fabric workspace
                </p>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new" className="flex-1 cursor-pointer">
                <span className="font-medium">Create New Workspace</span>
                <p className="text-sm text-muted-foreground">
                  Create a new Fabric workspace (or use existing if name matches)
                </p>
              </Label>
            </div>
          </RadioGroup>

          {mode === "existing" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Workspace</Label>
                {fetchingWorkspaces && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                  </span>
                )}
              </div>
              {fabricWorkspaces.length === 0 && !fetchingWorkspaces && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  No workspaces found.
                </div>
              )}
              {fabricWorkspaces.length > 0 && (
                <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricWorkspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        <div className="flex flex-col">
                          <span>{ws.displayName}</span>
                          <span className="text-xs text-muted-foreground">
                            {ws.type} {ws.capacityId && `• ${ws.capacityId.slice(0, 8)}...`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wsName">Workspace Name</Label>
                <Input
                  id="wsName"
                  placeholder="e.g. Sales Analytics 2026"
                  value={newWorkspace.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewWorkspace({ ...newWorkspace, name: value });
                    setWorkspaceStatusMessage(null);
                    setWorkspaceStatusType(null);
                    checkWorkspaceName(value);
                  }}
                  className={
                    nameAvailability.status === "taken"
                      ? "border-destructive focus-visible:ring-destructive"
                      : nameAvailability.status === "available"
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                  }
                />

                {/* Immediate availability feedback */}
                <div className="min-h-[20px] text-sm pl-1 flex items-center gap-1.5">
                  {nameAvailability.status === "checking" && (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Checking availability...</span>
                    </>
                  )}

                  {nameAvailability.status === "available" && newWorkspace.name.trim() && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">
                        {nameAvailability.message || "Available"}
                      </span>
                    </>
                  )}

                  {nameAvailability.status === "taken" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">
                        {nameAvailability.message || "Already exists"}
                      </span>
                    </>
                  )}
                </div>

                {/* Creation status (after API call) */}
                {workspaceStatusMessage && (
                  <p
                    className={`text-sm mt-1 ${
                      workspaceStatusType === "success"
                        ? "text-green-600 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {workspaceStatusMessage}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  {fetchingCapacities ? (
                    <div className="h-10 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    <Select
                      value={newWorkspace.capacityId}
                      onValueChange={(id) => {
                        const cap = capacities.find((c) => c.capacityId === id);
                        setNewWorkspace({
                          ...newWorkspace,
                          capacityId: id,
                          region: cap?.region || "",
                        });
                      }}
                      disabled={fetchingCapacities || capacities.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        {capacities.map((cap) => (
                          <SelectItem key={cap.capacityId} value={cap.capacityId}>
                            {cap.capacityName} ({cap.sku}) – {cap.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input
                    value={newWorkspace.region}
                    disabled
                    placeholder="Selected from capacity"
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="azure"
            onClick={handleConfirm}
            disabled={
              loading ||
              fetchingCapacities ||
              (mode === "new" &&
                (!newWorkspace.name.trim() ||
                  !newWorkspace.capacityId ||
                  nameAvailability.status === "taken" ||
                  nameAvailability.status === "checking"))
            }
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {loading
              ? mode === "new"
                ? "Processing Workspace..."
                : "Connecting..."
              : "Start Migration"}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}