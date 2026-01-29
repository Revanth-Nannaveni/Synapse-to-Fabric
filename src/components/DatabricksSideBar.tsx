import { cn } from "@/lib/utils";
import {
  Briefcase,
  BookOpen,
  Server,
  Layers,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DatabricksSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
  onLogout: () => void;
  workspaceName: string;
  counts: {
    jobs: number;
    notebooks: number;
    clusters: number;
  };
}

const menuItems = [
  { id: "inventory", label: "Inventory", icon: Layers, active: true },
];

const inventoryItems = [
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "notebooks", label: "Notebooks", icon: BookOpen },
  { id: "clusters", label: "Clusters", icon: Server },
];

export function DatabricksSidebar({
  activeTab,
  onTabChange,
  onBack,
  onLogout,
  workspaceName,
  counts,
}: DatabricksSidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r flex flex-col">
      {/* Back Button & Workspace Info */}
      <div className="p-4 border-b">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
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
              {workspaceName || "Databricks Workspace"}
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
                        onClick={() => onTabChange(subItem.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors justify-between",
                          activeTab === subItem.id
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-sidebar-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <subItem.icon className="w-3.5 h-3.5" />
                          {subItem.label}
                        </div>
                        <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                          {counts[subItem.id as keyof typeof counts]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}