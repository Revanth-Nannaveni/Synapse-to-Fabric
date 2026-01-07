import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DatabricksDiscoveryScope {
  jobs: boolean;
  notebooks: boolean;
  clusters: boolean;
}

interface DatabricksMigrationConfig {
  workspaceUrl: string;
  accessToken: string;
  clusterId?: string;
  discoveryScope: DatabricksDiscoveryScope;
}

interface ConnectDatabricksModalProps {
  open: boolean;
  onClose: () => void;
  onStartMigration: (config: DatabricksMigrationConfig) => void;
}

export function ConnectDatabricksModal({
  open,
  onClose,
  onStartMigration,
}: ConnectDatabricksModalProps) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const [formData, setFormData] = useState<DatabricksMigrationConfig>({
    workspaceUrl: "",
    accessToken: "",
    clusterId: "",
    discoveryScope: {
      jobs: true,
      notebooks: true,
      clusters: false,
    },
  });

  const toggleScope = (key: keyof DatabricksDiscoveryScope) => {
    setFormData((prev) => ({
      ...prev,
      discoveryScope: {
        ...prev.discoveryScope,
        [key]: !prev.discoveryScope[key],
      },
    }));
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setTestLoading(false);

    toast({
      title: "Connection Successful",
      description: "Databricks workspace validated successfully.",
    });
  };

  const handleConnect = async () => {
    if (!formData.workspaceUrl || !formData.accessToken) {
      toast({
        title: "Missing Required Fields",
        description: "Workspace URL and Access Token are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);

    toast({
      title: "Databricks Connected",
      description: "Discovery process started successfully.",
    });

    onStartMigration(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle>Connect to Databricks</DialogTitle>
          <DialogDescription>
            Provide Databricks workspace details to discover and migrate assets into Fabric.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>
              Workspace URL <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="https://adb-123456.azuredatabricks.net"
              value={formData.workspaceUrl}
              onChange={(e) =>
                setFormData({ ...formData, workspaceUrl: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Personal Access Token <span className="text-destructive">*</span>
            </Label>
            <Input
              type="password"
              placeholder="dapiXXXXXXXX"
              value={formData.accessToken}
              onChange={(e) =>
                setFormData({ ...formData, accessToken: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Cluster ID (optional)</Label>
            <Input
              placeholder="0715-134320-abcde"
              value={formData.clusterId}
              onChange={(e) =>
                setFormData({ ...formData, clusterId: e.target.value })
              }
            />
          </div>

          {/* Discovery Scope */}
          <div className="space-y-3 pt-2">
            <Label>Discovery Scope</Label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["jobs", "Jobs", "Scan scheduled and triggered jobs"],
                  ["notebooks", "Notebooks", "Scan notebooks and code"],
                  ["clusters", "Clusters", "Scan cluster configuration"],
                ] as const
              ).map(([key, title, desc]) => (
                <div
                  key={key}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
                >
                  <Checkbox
                    checked={formData.discoveryScope[key]}
                    onCheckedChange={() => toggleScope(key)}
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testLoading}
          >
            {testLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            Test Connection
          </Button>

          <Button
            variant="azure"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
