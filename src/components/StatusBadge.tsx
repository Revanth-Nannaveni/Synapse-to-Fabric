import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, AlertTriangle, Loader2, MinusCircle, Ban, FastForward, HelpCircle } from "lucide-react";
import type { Status } from "@/types/migration";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { icon: React.ElementType; className: string; label: string }> = {
  Success: {
    icon: CheckCircle2,
    className: "status-badge status-success",
    label: "Success",
  },
  Running: {
    icon: Loader2,
    className: "status-badge status-running",
    label: "Running",
  },
  Failed: {
    icon: XCircle,
    className: "status-badge status-failed",
    label: "Failed",
  },
  Ready: {
    icon: CheckCircle2,
    className: "status-badge status-ready",
    label: "Ready",
  },
  Deprecated: {
    icon: AlertTriangle,
    className: "status-badge bg-warning/10 text-warning",
    label: "Deprecated",
  },
  Pending: {
    icon: Clock,
    className: "status-badge bg-muted text-muted-foreground",
    label: "Pending",
  },
  Queued: {
    icon: Clock,
    className: "status-badge bg-blue-500/10 text-blue-600 border border-blue-500/20",
    label: "Queued",
  },
  Cancelled: {
    icon: Ban,
    className: "status-badge bg-gray-500/10 text-gray-600 border border-gray-500/20",
    label: "Cancelled",
  },
  Skipped: {
    icon: FastForward,
    className: "status-badge bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
    label: "Skipped",
  },
  Unknown: {
    icon: HelpCircle,
    className: "status-badge bg-muted text-muted-foreground border border-border",
    label: "Unknown",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(config.className, className)}>
      <Icon className={cn("w-3.5 h-3.5", status === "Running" && "animate-spin")} />
      {config.label}
    </span>
  );
}