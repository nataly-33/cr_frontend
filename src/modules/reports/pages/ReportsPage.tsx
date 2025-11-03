import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Download, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { reportsService } from "../services/reports.service";
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

      setExecutions(data.results);
      setTotalItems(data.count);
      setTotalPages(Math.ceil(data.count / pageSize));
    } catch (error) {
      console.error("Error loading executions:", error);
      showToast.error("Error al cargar historial de reportes");
    } finally {
      setLoadingHistory(false);
    }
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
      showToast.success("Reporte generándose. Aparecerá en el historial cuando esté listo.");
      
      // Reload executions to show the new report
      loadExecutions();
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
                className="text-blue-600 hover:text-blue-900"
                title="Ver detalles"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDownload(execution)}
                className="text-green-600 hover:text-green-900"
                title="Descargar"
              >
                <Download className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Generate Report Form */}
      <Card>
        <div className="p-6">
          <CardHeader
            title="Generar Reporte"
            subtitle="Selecciona el tipo de reporte y formato de salida"
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Reporte *"
                {...register("report_type")}
                error={errors.report_type?.message}
              >
                <option value="">Seleccione un tipo</option>
                {Object.entries(REPORT_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>

              <Select
                label="Formato de Salida *"
                {...register("output_format")}
                error={errors.output_format?.message}
              >
                <option value="">Seleccione un formato</option>
                {Object.entries(OUTPUT_FORMATS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>

              <Input
                label="Fecha de Inicio"
                type="date"
                {...register("start_date")}
                error={errors.start_date?.message}
              />

              <Input
                label="Fecha de Fin"
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
              >
                Generar Reporte
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Report History */}
      <Card>
        <div className="p-6">
          <CardHeader
            title="Historial de Reportes"
            subtitle="Reportes generados recientemente"
          />

          <div className="mt-6">
            <Table
              columns={columns}
              data={executions}
              isLoading={loadingHistory}
              emptyMessage="No se encontraron reportes"
            />

            {totalPages > 1 && (
              <div className="mt-4">
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
          </div>
        </div>
      </Card>
    </div>
  );
};
