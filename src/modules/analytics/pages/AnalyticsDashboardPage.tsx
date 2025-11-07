import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw, Users, FileText, ClipboardList, Flame } from 'lucide-react';
import { analyticsService, type AnalyticsData } from '../services';
import { SimpleLineChart } from '@/shared/components/charts/LineChartComponent';
import { SimpleBarChart } from '@/shared/components/charts/BarChartComponent';
import { SimpleAreaChart } from '@/shared/components/charts/AreaChartComponent';
import { SimplePieChart } from '@/shared/components/charts/PieChartComponent';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';

export const AnalyticsDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const months = parseInt(searchParams.get('months') || '12');
  const days = parseInt(searchParams.get('days') || '30');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyticsService.getOverview(months, days);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [months, days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
          <Button onClick={loadData} variant="primary" className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  // Transformar datos para gráficos
  const patientChartData = data.patients_by_month.map((item) => ({
    name: item.month,
    value: item.value,
  }));

  const documentChartData = data.documents_by_type.map((item) => ({
    name: item.label,
    value: item.count,
  }));

  const activityChartData = data.activity_by_day.map((item) => ({
    name: item.day,
    value: item.value,
  }));

  const specialtyChartData = data.top_specialties.map((item) => ({
    name: item.specialty,
    value: item.count,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Análisis completo de tu clínica</p>
          </div>
          <Button
            onClick={loadData}
            variant="outline"
            className="flex gap-2 items-center"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Patients */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Pacientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data.summary.total_patients}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  +{data.summary.patients_this_month} este mes
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-2xl text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Total Documents */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Documentos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data.summary.total_documents}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  +{data.summary.documents_this_month} este mes
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="text-2xl text-green-600" />
              </div>
            </div>
          </Card>

          {/* Total Records */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Historias Clínicas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data.summary.total_records}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  +{data.summary.records_this_month} este mes
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="text-2xl text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Activity Today */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Actividad Hoy</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data.summary.activity_today}
                </p>
                <p className="text-sm text-blue-600 mt-2">acciones registradas</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Flame className="text-2xl text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Patients by Month - Line Chart */}
          <Card className="p-6">
            <SimpleLineChart
              data={patientChartData}
              title="Pacientes por Mes"
              dataKey="value"
              stroke="#3b82f6"
              height={300}
            />
          </Card>

          {/* Activity by Day - Area Chart */}
          <Card className="p-6">
            <SimpleAreaChart
              data={activityChartData}
              title="Actividad por Día"
              dataKey="value"
              fill="#10b981"
              stroke="#10b981"
              height={300}
            />
          </Card>

          {/* Documents by Type - Bar Chart */}
          <Card className="p-6">
            <SimpleBarChart
              data={documentChartData}
              title="Documentos por Tipo"
              dataKey="value"
              fill="#8b5cf6"
              height={300}
            />
          </Card>

          {/* Top Specialties - Pie Chart */}
          <Card className="p-6">
            <SimplePieChart
              data={specialtyChartData}
              title="Especialidades Principales"
              dataKey="value"
              height={300}
            />
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Specialties Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Top Especialidades
            </h3>
            <div className="space-y-3">
              {data.top_specialties.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.specialty}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Doctors Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Doctores Más Activos
            </h3>
            <div className="space-y-3">
              {data.top_doctors.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.doctor}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {item.documents} docs
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
