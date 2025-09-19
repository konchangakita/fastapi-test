'use client';

interface HealthStatusProps {
  health: { status: string; timestamp: string } | null;
}

export default function HealthStatus({ health }: HealthStatusProps) {
  if (!health) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          サーバー状態
        </h2>
        <div className="text-center text-gray-500">
          状態を確認中...
        </div>
      </div>
    );
  }

  const isHealthy = health.status === 'healthy';
  const statusColor = isHealthy ? 'green' : 'red';
  const statusIcon = isHealthy ? '🟢' : '🔴';
  const statusText = isHealthy ? '正常' : '異常';

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        サーバー状態
      </h2>
      
      <div className={`p-4 rounded-lg bg-${statusColor}-50 border border-${statusColor}-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{statusIcon}</span>
            <div>
              <p className={`font-semibold text-${statusColor}-700`}>
                {statusText}
              </p>
              <p className={`text-sm text-${statusColor}-600`}>
                {formatTimestamp(health.timestamp)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
