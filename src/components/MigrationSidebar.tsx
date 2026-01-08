import { cn } from "@/lib/utils";
import {
  Database,
  BookOpen,
  GitBranch,
  Link2,
  LayoutGrid,
  FileBarChart,
  Monitor,
  Settings,
  LogOut,
  ChevronLeft,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MigrationSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
  workspaceName: string; // Added this prop
}

const menuItems = [
  // { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "inventory", label: "Inventory", icon: Layers, active: true },
  // { id: "migrationPlan", label: "Migration Plan", icon: FileBarChart },
  // { id: "monitor", label: "Monitor", icon: Monitor },
  // { id: "settings", label: "Settings", icon: Settings },
];

const inventoryItems = [
  { id: "sparkPools", label: "Spark Pools", icon: Database },
  { id: "notebooks", label: "Notebooks", icon: BookOpen },
  { id: "pipelines", label: "Pipelines", icon: GitBranch },
  { id: "linkedServices", label: "Linked Services", icon: Link2 },
];

export function MigrationSidebar({ activeTab, onTabChange, onBack, workspaceName }: MigrationSidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r flex flex-col">
      {/* Logo */}
      {/* <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Database className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">MigratePro</span>
        </div>
      </div> */}

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
              {workspaceName
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'SW'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {workspaceName}
            </p>
            <p className="text-xs text-muted-foreground">Admin Access</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 pt-16">
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
                        onClick={() => onTabChange(subItem.id)}
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

    </aside>
  );
}