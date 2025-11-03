import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, FileText, CheckCircle, XCircle } from "lucide-react";
import { reportsService } from "../services/reports.service";
import type { ReportExecution } from "../types";
import { REPORT_TYPES } from "../types";
import {
  Button,
  Card,
  CardHeader,
  Badge,
} from "@shared/components/ui";
import { showToast, formatDate } from "@shared/utils";

export const ReportViewerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [execution, setExecution] = useState<ReportExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      loadExecution(id);
    }
  }, [id]);

  const loadExecution = async (executionId: string) => {
    try {
      setLoading(true);
      const data = await reportsService.getExecutionById(executionId);
      setExecution(data);
    } catch (error) {
      console.error("Error loading execution:", error);
      showToast.error("Error al cargar el reporte");
      navigate("/reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!execution) return;

    try {
      setDownloading(true);
      const fileName = `${execution.report_type}_${formatDate(execution.executed_at)}.${execution.output_format}`;
      await reportsService.downloadFile(execution.id, fileName);
      showToast.success("Reporte descargado exitosamente");
    } catch (error) {
      console.error("Error downloading report:", error);
      showToast.error("Error al descargar el reporte");
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!execution) return;

    try {
      await reportsService.generate({
        report_type: execution.report_type as any,
        output_format: execution.output_format as any,
      });
      showToast.success("Reporte regenerándose. Volviendo al listado...");
      setTimeout(() => navigate("/reports"), 1500);
    } catch (error) {
      console.error("Error regenerating report:", error);
      showToast.error("Error al regenerar el reporte");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Reporte no encontrado</div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (execution.status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <FileText className="h-6 w-6 text-blue-600" />;
    }
  };

  const getStatusBadge = () => {
    const statusMap = {
      pending: { variant: "warning" as const, label: "Pendiente" },
      processing: { variant: "info" as const, label: "Procesando" },
      completed: { variant: "success" as const, label: "Completado" },
      failed: { variant: "error" as const, label: "Fallido" },
    };

    const config = statusMap[execution.status as keyof typeof statusMap];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/reports")}
        >
          Volver a Reportes
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <CardHeader
            title="Detalles del Reporte"
            subtitle="Información completa del reporte generado"
            actions={
              <div className="flex gap-2">
                {execution.status === "completed" && (
                  <Button
                    onClick={handleDownload}
                    leftIcon={<Download className="h-4 w-4" />}
                    disabled={downloading}
                    isLoading={downloading}
                  >
                    Descargar
                  </Button>
                )}
                {execution.status === "failed" && (
                  <Button
                    onClick={handleRegenerate}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                  >
                    Regenerar
                  </Button>
                )}
              </div>
            }
          />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {REPORT_TYPES[execution.report_type as keyof typeof REPORT_TYPES] || execution.report_type}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Reporte generado
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Estado: </span>
                  {getStatusBadge()}
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Formato: </span>
                  <Badge variant="default">{execution.output_format.toUpperCase()}</Badge>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Generado por: </span>
                  <span className="text-sm text-gray-600">
                    {execution.executed_by_name || execution.executed_by}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Fecha de ejecución: </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(execution.executed_at)}
                  </span>
                </div>

                {execution.completed_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fecha de finalización: </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(execution.completed_at)}
                    </span>
                  </div>
                )}

                {execution.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800">Error:</p>
                    <p className="text-sm text-red-600 mt-1">
                      {execution.error_message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Filters Information */}
            {execution.filters && Object.keys(execution.filters).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Filtros Aplicados
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {Object.entries(execution.filters).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/_/g, " ")}:
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
