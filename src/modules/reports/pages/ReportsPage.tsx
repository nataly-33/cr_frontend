import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  Zap,
  BarChart3
} from "lucide-react";
import { reportsService } from "../services/reports.service";
import { AIActionsMenu } from "../components/AIActionsMenu";
import type { ReportExecution } from "../types";
import { REPORT_TYPES, OUTPUT_FORMATS } from "../types";
import {
  Button,
  Input,
  Card,
  CardHeader,
  Badge,
  Select,
  Table,
  Pagination,
} from "@shared/components/ui";
import { useTable } from "@shared/hooks";
import { showToast, formatDate } from "@shared/utils";

const reportFormSchema = z.object({
  report_type: z.string().min(1, "El tipo de reporte es requerido"),
  output_format: z.string().min(1, "El formato de salida es requerido"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

// Statistics Card Component
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  variant = "default" 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  variant?: "default" | "success" | "warning" | "error" 
}) => {
  const bgColors = {
    default: "bg-blue-50",
    success: "bg-green-50",
    warning: "bg-yellow-50",
    error: "bg-red-50",
  };

  const textColors = {
    default: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
  };

  return (
    <div className={`rounded-lg p-6 border border-gray-200 ${bgColors[variant]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-white`}>
          <Icon className={`h-8 w-8 ${textColors[variant]}`} />
        </div>
      </div>
    </div>
  );
};

export const ReportsPage = () => {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [generating, setGenerating] = useState(false);

  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    getPaginationParams,
  } = useTable({ initialPageSize: 10 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      report_type: "",
      output_format: "pdf",
    },
  });

  useEffect(() => {
    loadExecutions();
  }, [currentPage, pageSize]);

  // Poll for report status updates
  useEffect(() => {
    const pendingReports = executions.filter(
      (exec) => exec.status === "pending" || exec.status === "processing"
    );

    if (pendingReports.length > 0) {
      const interval = setInterval(() => {
        loadExecutions();
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [executions]);

  const loadExecutions = async () => {
    try {
      setLoadingHistory(true);
      const params = getPaginationParams;
      const data = await reportsService.getExecutions({
        page: params.page,
        page_size: params.page_size,
        ordering: "-created_at",
      });

      setExecutions(data.results || []);
      setTotalItems(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
    } catch (error) {
      console.error("Error loading executions:", error);
      showToast.error("Error al cargar historial de reportes");
      setExecutions([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: totalItems,
    completed: executions.filter((e) => e.status === "completed").length,
    processing: executions.filter((e) => e.status === "processing" || e.status === "pending").length,
    failed: executions.filter((e) => e.status === "failed").length,
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      setGenerating(true);

      const generateData: any = {
        report_type: data.report_type,
        output_format: data.output_format,
        filters: {},
      };

      // Add date filters if provided
      if (data.start_date) {
        generateData.filters.start_date = data.start_date;
      }
      if (data.end_date) {
        generateData.filters.end_date = data.end_date;
      }

      await reportsService.generate(generateData);
      showToast.success("✨ Reporte en cola. Se procesará en segundos.");
      
      // Reset form
      reset({ report_type: "", output_format: "pdf" });
      
      // Reload executions to show the new report
      setTimeout(loadExecutions, 1000);
    } catch (error: any) {
      console.error("Error generating report:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al generar el reporte";
      showToast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (execution: ReportExecution) => {
    try {
      const fileName = `${execution.report_type}_${formatDate(execution.executed_at)}.${execution.output_format}`;
      await reportsService.downloadFile(execution.id, fileName);
      showToast.success("Reporte descargado exitosamente");
    } catch (error) {
      console.error("Error downloading report:", error);
      showToast.error("Error al descargar el reporte");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "warning" as const, icon: Clock, label: "Pendiente" },
      processing: { variant: "info" as const, icon: Clock, label: "Procesando" },
      completed: { variant: "success" as const, icon: CheckCircle, label: "Completado" },
      failed: { variant: "error" as const, icon: XCircle, label: "Fallido" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <div className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </div>
      </Badge>
    );
  };

  const columns = [
    {
      key: "report_type",
      label: "Tipo de Reporte",
      render: (execution: ReportExecution) => (
        <div className="font-medium text-gray-900">
          {REPORT_TYPES[execution.report_type as keyof typeof REPORT_TYPES] || execution.report_type}
        </div>
      ),
    },
    {
      key: "output_format",
      label: "Formato",
      render: (execution: ReportExecution) => (
        <Badge variant="default">
          {execution.output_format.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (execution: ReportExecution) => getStatusBadge(execution.status),
    },
    {
      key: "executed_at",
      label: "Fecha de Creación",
      render: (execution: ReportExecution) => (
        <div className="text-sm text-gray-500">
          {formatDate(execution.executed_at)}
        </div>
      ),
    },
    {
      key: "executed_by_name",
      label: "Generado por",
      render: (execution: ReportExecution) => (
        <div className="text-sm">{execution.executed_by_name || execution.executed_by}</div>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (execution: ReportExecution) => (
        <div className="flex items-center gap-2">
          {execution.status === "completed" && (
            <>
              <button
                onClick={() => navigate(`/reports/${execution.id}`)}
                className="text-blue-600 hover:text-blue-900 transition-colors"
                title="Ver detalles"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDownload(execution)}
                className="text-green-600 hover:text-green-900 transition-colors"
                title="Descargar"
              >
                <Download className="h-4 w-4" />
              </button>
              <AIActionsMenu execution={execution} />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Reportes
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Genera y gestiona reportes de tu clínica con análisis de IA integrado
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {totalItems > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total de Reportes"
            value={stats.total}
            variant="default"
          />
          <StatCard
            icon={CheckCircle}
            label="Completados"
            value={stats.completed}
            variant="success"
          />
          <StatCard
            icon={Clock}
            label="Procesando"
            value={stats.processing}
            variant="warning"
          />
          <StatCard
            icon={XCircle}
            label="Fallidos"
            value={stats.failed}
            variant="error"
          />
        </div>
      )}

      {/* Generate Report Form */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-25">
        <div className="p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardHeader
                title="Generar Nuevo Reporte"
                subtitle="Selecciona el tipo, formato y rango de fechas para tu reporte"
              />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-1">
                    <Select
                      label="Tipo de Reporte *"
                      {...register("report_type")}
                      error={errors.report_type?.message}
                    >
                      <option value="">Seleccione...</option>
                      {Object.entries(REPORT_TYPES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="lg:col-span-1">
                    <Select
                      label="Formato *"
                      {...register("output_format")}
                      error={errors.output_format?.message}
                    >
                      <option value="">Seleccione...</option>
                      {Object.entries(OUTPUT_FORMATS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Input
                    label="Fecha Inicio"
                    type="date"
                    {...register("start_date")}
                    error={errors.start_date?.message}
                  />

                  <Input
                    label="Fecha Fin"
                    type="date"
                    {...register("end_date")}
                    error={errors.end_date?.message}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    leftIcon={<FileText className="h-4 w-4" />}
                    disabled={generating}
                    isLoading={generating}
                    className="px-6"
                  >
                    {generating ? "Generando..." : "Generar Reporte"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Card>

      {/* Report History */}
      <Card>
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <CardHeader
                title="Historial de Reportes"
                subtitle={`${totalItems} reportes en total`}
              />
            </div>
            {loadingHistory && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Actualizando...
              </div>
            )}
          </div>

          {executions.length > 0 ? (
            <>
              <Table
                columns={columns}
                data={executions}
                isLoading={loadingHistory}
                emptyMessage="No se encontraron reportes"
              />

              {totalPages > 1 && (
                <div className="mt-6 border-t pt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay reportes aún</p>
              <p className="text-gray-400 text-sm mt-2">
                Genera tu primer reporte usando el formulario de arriba
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>💡 Consejo:</strong> Los reportes se procesan en segundo plano. Puedes navegar a otras secciones mientras esperas. Los reportes completados estarán disponibles para descargar y analizar con IA.
        </p>
      </div>
    </div>
  );
};
