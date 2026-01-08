import React from 'react';
import { X, Check, XCircle, Database, FileText, Zap, Warehouse, BarChart3, Server, Cpu } from 'lucide-react';

const DetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const { type, data } = item;

const renderSparkPoolDetails = (sparkPool) => (
    <div className="space-y-4">
      <DetailSection title="Basic Information">
        <DetailRow label="Name" value={sparkPool.name} />
        <DetailRow label="ID" value={sparkPool.id} />
        <DetailRow label="Type" value={sparkPool.type} />
        <DetailRow label="Node Family" value={sparkPool.nodeFamily} />
        <DetailRow label="Node Size" value={sparkPool.nodeSize} />
      </DetailSection>

      <DetailSection title="Auto Scale Configuration">
        <DetailRow 
          label="Auto Scale" 
          value={sparkPool.autoScale?.enabled ? "Enabled" : "Disabled"}
          badge={sparkPool.autoScale?.enabled}
        />
        {sparkPool.autoScale?.enabled === true && (
          <>
            <DetailRow label="Min Node Count" value={sparkPool.autoScale.minNodeCount} />
            <DetailRow label="Max Node Count" value={sparkPool.autoScale.maxNodeCount} />
          </>
        )}
      </DetailSection>

      <DetailSection title="Dynamic Executor Allocation">
        <DetailRow 
          label="Dynamic Allocation" 
          value={sparkPool.dynamicExecutorAllocation?.enabled ? "Enabled" : "Disabled"}
          badge={sparkPool.dynamicExecutorAllocation?.enabled}
        />
        {sparkPool.dynamicExecutorAllocation?.enabled === true && (
          <>
            <DetailRow label="Min Executors" value={sparkPool.dynamicExecutorAllocation.minExecutors} />
            <DetailRow label="Max Executors" value={sparkPool.dynamicExecutorAllocation.maxExecutors} />
          </>
        )}
      </DetailSection>
    </div>
  );
  
  const renderLakehouseDetails = (lakehouse) => (
    <div className="space-y-4">
      <DetailSection title="Basic Information">
        <DetailRow label="Name" value={lakehouse.name || lakehouse.displayName} />
        <DetailRow label="Workspace" value={lakehouse.workspace} />
        <DetailRow label="ID" value={lakehouse.id} />
        <DetailRow label="Type" value={lakehouse.type} />
        <DetailRow label="Status" value={lakehouse.status} badge={lakehouse.status === "Success"} />
      </DetailSection>

      {lakehouse.properties && (
        <>
          <DetailSection title="OneLake Paths">
            <DetailRow 
              label="Tables Path" 
              value={lakehouse.properties.oneLakeTablesPath}
              isUrl
            />
            <DetailRow 
              label="Files Path" 
              value={lakehouse.properties.oneLakeFilesPath}
              isUrl
            />
          </DetailSection>

          {lakehouse.properties.sqlEndpointProperties && (
            <DetailSection title="SQL Endpoint">
              <DetailRow 
                label="Connection String" 
                value={lakehouse.properties.sqlEndpointProperties.connectionString}
                isUrl
              />
              <DetailRow 
                label="Endpoint ID" 
                value={lakehouse.properties.sqlEndpointProperties.id}
              />
              <DetailRow 
                label="Provisioning Status" 
                value={lakehouse.properties.sqlEndpointProperties.provisioningStatus}
                badge={lakehouse.properties.sqlEndpointProperties.provisioningStatus === "Success"}
              />
            </DetailSection>
          )}
        </>
      )}
    </div>
  );

  const renderGenericDetails = (item) => (
    <div className="space-y-4">
      <DetailSection title="Basic Information">
        <DetailRow label="Name" value={item.name || item.displayName} />
        <DetailRow label="Workspace" value={item.workspace} />
        <DetailRow label="ID" value={item.id} />
        <DetailRow label="Type" value={item.type} />
        <DetailRow label="Status" value={item.status} badge={item.status === "Success"} />
        <DetailRow label="Last Modified" value={item.lastModified} />
      </DetailSection>
    </div>
  );

  const getIcon = () => {
    const typeKey = type.toLowerCase().replace(/\s+/g, '');
    switch (typeKey) {
      case 'lakehouse': return <Database className="w-5 h-5" />;
      case 'notebook': return <FileText className="w-5 h-5" />;
      case 'pipeline': return <Zap className="w-5 h-5" />;
      case 'warehouse': return <Warehouse className="w-5 h-5" />;
      case 'semanticmodel': return <BarChart3 className="w-5 h-5" />;
      case 'sparkpool': return <Cpu className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    return `${type} Details`;
  };

  const renderContent = () => {
    const typeKey = type.toLowerCase().replace(/\s+/g, '');
    switch (typeKey) {
      case 'sparkpool':
        return renderSparkPoolDetails(data);
      case 'lakehouse':
        return renderLakehouseDetails(data);
      default:
        return renderGenericDetails(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{getTitle()}</h2>
              <p className="text-sm text-muted-foreground">
                {data.name || data.displayName || 'Unnamed Item'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

const DetailSection = ({ title, children }) => (
  <div className="border rounded-lg p-4">
    <h3 className="text-sm font-semibold text-foreground mb-3">
      {title}
    </h3>
    <div className="space-y-2.5">
      {children}
    </div>
  </div>
);

const DetailRow = ({
  label,
  value,
  badge,
  isUrl,
}: {
  label: string;
  value: any;
  badge?: boolean;  
  isUrl?: boolean;
}) => (
  <div className="flex items-start gap-3 text-sm">
    <span className="text-muted-foreground min-w-[140px] pt-0.5">{label}</span>
    <div className="flex-1">
      {badge !== undefined ? (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium ${
          badge 
            ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
            : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
        }`}>
          {badge ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {value}
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" />
              {value}
            </>
          )}
        </span>
      ) : isUrl ? (
        <code className="text-xs text-blue-600 dark:text-blue-400 break-all bg-blue-500/5 px-2 py-1 rounded">
          {value}
        </code>
      ) : (
        <span className="text-foreground break-all">
          {value || 'N/A'}
        </span>
      )}
    </div>
  </div>
);

export default DetailModal;