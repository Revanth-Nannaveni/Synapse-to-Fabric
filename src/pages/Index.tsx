import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { FabricJobsHome } from "./FabricJobsHome";
import { MigrationWorkspace } from "./MigrationWorkspace";
import { DatabricksMigrationWorkspace } from "./DatabricksMigrationWorkspace";
import { MigrationReport } from "./MigrationReport";
import { ConnectSynapseModal } from "@/components/modals/ConnectSynapseModal";
import { ConnectDatabricksModal } from "@/components/modals/ConnectDatabricksModal";
import type { MigrationItem, SynapseConnection } from "@/types/migration";

type AppView = 
  | "home" 
  | "synapse-workspace" 
  | "databricks-workspace"
  | "migration-report";

const Index = () => {
  const { instance } = useMsal();
  const [currentView, setCurrentView] = useState<AppView>("home"); // Start at home, not login
  const [showSynapseModal, setShowSynapseModal] = useState(false);
  const [showDatabricksModal, setShowDatabricksModal] = useState(false);
  const [migrationItems, setMigrationItems] = useState<MigrationItem[]>([]);
  const [migrationSource, setMigrationSource] = useState<"synapse" | "databricks">("synapse");
  const [synapseApiResponse, setSynapseApiResponse] = useState<any>(null);

  const handleLogout = async () => {
    await instance.logoutPopup();
  };

  const handleMigrateFromSynapse = () => {
    setShowSynapseModal(true);
  };

  const handleMigrateFromDatabricks = () => {
    setShowDatabricksModal(true);
  };

  const handleSynapseConnect = (connection: SynapseConnection, apiResponse: any) => {
    console.log("Synapse connection established:", connection);
    console.log("API Response received:", apiResponse);
    
    setSynapseApiResponse(apiResponse);
    setShowSynapseModal(false);
    setCurrentView("synapse-workspace");
  };

  const handleDatabricksConnect = (config: any) => {
    setShowDatabricksModal(false);
    setCurrentView("databricks-workspace");
  };

  const handleMigrationComplete = (items: MigrationItem[], source: "synapse" | "databricks") => {
    setMigrationItems(items);
    setMigrationSource(source);
    setCurrentView("migration-report");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSynapseApiResponse(null);
  };

  return (
    <>
      {currentView === "home" && (
        <FabricJobsHome
          onLogout={handleLogout}
          onMigrateFromSynapse={handleMigrateFromSynapse}
          onMigrateFromDatabricks={handleMigrateFromDatabricks}
        />
      )}

      {currentView === "synapse-workspace" && synapseApiResponse && (
        <MigrationWorkspace
          onLogout={handleLogout}
          onBack={handleBackToHome}
          onMigrationComplete={(items) => handleMigrationComplete(items, "synapse")}
          apiResponse={synapseApiResponse}
        />
      )}

      {currentView === "databricks-workspace" && (
        <DatabricksMigrationWorkspace
          onLogout={handleLogout}
          onBack={handleBackToHome}
          onMigrationComplete={(items) => handleMigrationComplete(items, "databricks")}
        />
      )}

      {currentView === "migration-report" && (
        <MigrationReport
          items={migrationItems}
          onLogout={handleLogout}
          onBackToHome={handleBackToHome}
          source={migrationSource}
        />
      )}

      <ConnectSynapseModal
        open={showSynapseModal}
        onClose={() => setShowSynapseModal(false)}
        onConnect={handleSynapseConnect}
      />

      <ConnectDatabricksModal
        open={showDatabricksModal}
        onClose={() => setShowDatabricksModal(false)}
        onStartMigration={handleDatabricksConnect}
      />
    </>
  );
};

export default Index;