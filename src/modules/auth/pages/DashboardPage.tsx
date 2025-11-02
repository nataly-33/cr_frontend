import { Users, FileText, Activity, TrendingUp } from "lucide-react";

const stats = [
  { name: "Total Pacientes", value: "245", icon: Users, change: "+12%" },
  { name: "Documentos", value: "1,234", icon: FileText, change: "+8%" },
  { name: "Activos Hoy", value: "89", icon: Activity, change: "+23%" },
  { name: "Promedio Mensual", value: "456", icon: TrendingUp, change: "+5%" },
];

export const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
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
                    <div className="ml-2 text-sm font-semibold text-green-600">
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
