import { useState, useEffect } from "react";
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
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAzureCredentials } from "@/contexts/AzureCredentialsContext";
import type { Workspace } from "@/types/migration";

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

export function SelectTargetModal({ open, onClose, onConfirm }: SelectTargetModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingWorkspaces, setFetchingWorkspaces] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [fabricWorkspaces, setFabricWorkspaces] = useState<FabricWorkspace[]>([]);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    capacity: "",
    region: "",
  });
  const { toast } = useToast();
  const { credentials } = useAzureCredentials();

  // Fetch workspaces when modal opens
  useEffect(() => {
    if (open && credentials) {
      fetchFabricWorkspaces();
    }
  }, [open, credentials]);

  const fetchFabricWorkspaces = async () => {
    if (!credentials) {
      toast({
        title: "Missing Credentials",
        description: "Azure credentials not found. Please connect to Synapse first.",
        variant: "destructive",
      });
      return;
    }

    setFetchingWorkspaces(true);

    try {
      const response = await fetch(
         `${import.meta.env.VITE_API_BASE_URL}/ListFabricWorkspaces?code=${import.meta.env.VITE_API_CODE_LIST_FABRIC_WORKSPACES}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            tenantId: credentials.tenantId,
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret,
          }),
        }
      );

      console.log("Fabric Workspaces Response status:", response.status);

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      console.log("Parsed Fabric Workspaces:", result);

      if (response.ok && result.workspaces) {
        setFabricWorkspaces(result.workspaces);
        toast({
          title: "Workspaces Loaded",
          description: `Found ${result.workspaces.length} Fabric workspace(s).`,
        });
      } else {
        toast({
          title: "Failed to Load Workspaces",
          description: result.message || "Could not retrieve Fabric workspaces.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching Fabric workspaces:", error);
      toast({
        title: "Error Loading Workspaces",
        description: error instanceof Error ? error.message : "An error occurred while fetching workspaces.",
        variant: "destructive",
      });
    } finally {
      setFetchingWorkspaces(false);
    }
  };

  const handleConfirm = async () => {
    if (mode === "existing" && !selectedWorkspace) {
      toast({
        title: "No Workspace Selected",
        description: "Please select a target workspace.",
        variant: "destructive",
      });
      return;
    }

    if (mode === "new" && (!newWorkspace.name || !newWorkspace.capacity || !newWorkspace.region)) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields for the new workspace.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);

    const workspace =
      mode === "existing"
        ? {
            id: selectedWorkspace,
            name: fabricWorkspaces.find((w) => w.id === selectedWorkspace)?.displayName || "",
            capacity: fabricWorkspaces.find((w) => w.id === selectedWorkspace)?.capacityId || "N/A",
            region: "N/A", // API doesn't provide region info
          }
        : { id: "new", ...newWorkspace };

    toast({
      title: "Migration Started",
      description: `Migrating to ${workspace.name}...`,
    });

    onConfirm(workspace);
    onClose();
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
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "existing" | "new")}>
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
                  Create a new Fabric workspace for migration
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
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading...
                  </span>
                )}
              </div>
              
              {!fetchingWorkspaces && fabricWorkspaces.length === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  No workspaces found. Please check your credentials.
                </div>
              )}

              {fabricWorkspaces.length > 0 && (
                <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a workspace" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {fabricWorkspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        <div className="flex flex-col">
                          <span>{ws.displayName}</span>
                          <span className="text-xs text-muted-foreground">
                            {ws.type}
                            {ws.capacityId && ` • Capacity: ${ws.capacityId.substring(0, 8)}...`}
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
                  placeholder="Enter workspace name"
                  value={newWorkspace.name}
                  onChange={(e) =>
                    setNewWorkspace({ ...newWorkspace, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Select
                    value={newWorkspace.capacity}
                    onValueChange={(v) =>
                      setNewWorkspace({ ...newWorkspace, capacity: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="P1">P1</SelectItem>
                      <SelectItem value="P2">P2</SelectItem>
                      <SelectItem value="P3">P3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select
                    value={newWorkspace.region}
                    onValueChange={(v) =>
                      setNewWorkspace({ ...newWorkspace, region: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="East US">East US</SelectItem>
                      <SelectItem value="West US">West US</SelectItem>
                      <SelectItem value="North Europe">North Europe</SelectItem>
                      <SelectItem value="West Europe">West Europe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="azure" onClick={handleConfirm} disabled={loading || fetchingWorkspaces}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Connect & Start Migration
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
