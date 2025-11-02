import { Users, FileText, Activity, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Total Pacientes",
    value: "245",
    icon: Users,
    change: "+12%",
    changeType: "increase",
  },
  {
    name: "Documentos",
    value: "1,234",
    icon: FileText,
    change: "+8%",
    changeType: "increase",
  },
  {
    name: "Activos Hoy",
    value: "89",
    icon: Activity,
    change: "+23%",
    changeType: "increase",
  },
  {
    name: "Promedio Mensual",
    value: "456",
    icon: TrendingUp,
    change: "+5%",
    changeType: "increase",
  },
];

export const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === "increase"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Documentos Recientes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Documentos Recientes
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">No hay documentos recientes</p>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">No hay actividad reciente</p>
          </div>
        </div>
      </div>
    </div>
  );
};
