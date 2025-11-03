import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { dashboardService, type DashboardStats } from "../services/dashboard.service";

const StatCard = ({
  name,
  value,
  icon: Icon,
  change,
  changeType,
  isLoading,
}: {
  name: string;
  value: string | number;
  icon: React.ComponentType<{ className: string }>;
  change: string;
  changeType: "increase" | "decrease";
  isLoading: boolean;
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {name}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="text-gray-400">Cargando...</span>
                ) : (
                  value
                )}
              </div>
              <div
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        setError(
          "Error al cargar las estadísticas. Por favor, intenta de nuevo."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Recargar cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      name: "Total Pacientes",
      value: stats?.totalPatients || 0,
      icon: Users,
      change: "+12%",
      changeType: "increase" as const,
    },
    {
      name: "Documentos",
      value: stats?.totalDocuments || 0,
      icon: FileText,
      change: "+8%",
      changeType: "increase" as const,
    },
    {
      name: "Historias Clínicas",
      value: stats?.totalClinicalRecords || 0,
      icon: Activity,
      change: "+23%",
      changeType: "increase" as const,
    },
    {
      name: "Promedio Mensual",
      value: stats?.averageMonthly || 0,
      icon: TrendingUp,
      change: "+5%",
      changeType: "increase" as const,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <StatCard
            key={stat.name}
            name={stat.name}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
            isLoading={loading}
          />
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Documentos Recientes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Documentos Recientes
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (stats?.recentDocuments?.length || 0) > 0 ? (
            <div className="space-y-3">
              {stats?.recentDocuments?.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Paciente: {doc.patient_name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay documentos recientes</p>
          )}
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (stats?.recentActivity?.length || 0) > 0 ? (
            <div className="space-y-3">
              {stats?.recentActivity?.map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Por: {activity.user_name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay actividad reciente</p>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          ℹ️ Los datos se actualizan automáticamente cada 30 segundos. Última
          actualización:{" "}
          <span className="font-semibold">
            {new Date().toLocaleTimeString("es-ES")}
          </span>
        </p>
      </div>
    </div>
  );
};
