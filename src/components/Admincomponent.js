// Dashboard stat cards
export function StatCard({ icon: Icon, label, value, change, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change.positive ? "text-green-600" : "text-red-600"}`}>
              {change.positive ? "↑" : "↓"} {Math.abs(change.percent)}% from last month
            </p>
          )}
        </div>
        {Icon && <Icon className="h-8 w-8 text-gray-400" />}
      </div>
    </div>
  );
}

// Loading skeleton
export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-12 animate-pulse" />
      ))}
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

// Modal component
export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white w-full ${sizeClasses[size]} rounded-xl shadow-xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Alert component
export function Alert({ type = "info", title, message, onClose }) {
  const colors = {
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-4 ${colors[type]}`}>
      <span className="text-xl font-bold">{icons[type]}</span>
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        {message && <p className="text-sm">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-lg font-bold opacity-50 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}

// Table component
export function Table({ columns, data, loading, empty }) {
  if (loading) return <LoadingSkeleton />;

  if (!data || data.length === 0) {
    return <EmptyState title={empty?.title || "No data"} description={empty?.description || "No items to display"} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-3 text-sm text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Badge component
export function Badge({ text, type = "default", size = "md" }) {
  const typeClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span className={`inline-block rounded-full font-medium ${typeClasses[type]} ${sizeClasses[size]}`}>
      {text}
    </span>
  );
}

// Tabs component
export function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
