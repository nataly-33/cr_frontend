/**
 * Página principal de Reportes con IA
 * Permite generar reportes mediante lenguaje natural (solo texto)
 */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import reportsAIService, {
  type ExecuteQueryResponse,
  type QueryHistory,
} from "../services/reports-ai.service";

export const ReportAIPage = () => {
  // Estado principal
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<ExecuteQueryResponse | null>(null);
  const [history, setHistory] = useState<QueryHistory[]>([]);

  // Configuración
  const language = "es"; // Idioma fijo en español
  const [outputFormat, setOutputFormat] = useState<
    "json" | "csv" | "excel" | "pdf"
  >("json");
  const [rowLimit, setRowLimit] = useState(100);
  const [aiProvider, setAiProvider] = useState<"openai" | "local">("local");

  // Cargar historial al montar
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await reportsAIService.getHistory(20);
      setHistory(data);
    } catch (error: any) {
      console.error("Error loading history:", error);
    }
  };

  const handleGenerateReport = async () => {
    if (!queryText.trim()) {
      toast.warning("Por favor ingresa una consulta");
      return;
    }

    setLoading(true);
    setExecutionResult(null);

    try {
      // Ejecutar consulta directa (parseo + ejecución)
      const result = await reportsAIService.directQuery({
        query_text: queryText,
        language,
        output_format: outputFormat,
        row_limit: rowLimit,
        ai_provider: aiProvider,
      });

      setExecutionResult(result);

      // Si no es JSON, descargar archivo automáticamente
      if (outputFormat !== "json" && result.download_url) {
        reportsAIService.downloadByUrl(result.download_url);
        toast.success("Reporte generado y descargado exitosamente");
      } else {
        toast.success(`Reporte generado: ${result.result_count} registros`);
      }

      // Recargar historial
      loadHistory();
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(error.response?.data?.error || "Error al generar reporte");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromHistory = (item: QueryHistory) => {
    setQueryText(item.query_text);
    setExecutionResult(null);
  };

  const handleClearQuery = () => {
    setQueryText("");
    setExecutionResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "rgb(var(--text-primary))" }}
        >
          Reportes con IA - Gestión Documental
        </h1>
        <p style={{ color: "rgb(var(--text-secondary))" }}>
          Genera reportes de historias clínicas y documentos usando lenguaje
          natural.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - Query Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de consulta */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Tu Consulta</h2>

            {/* Textarea de consulta */}
            <div className="relative mb-4">
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Ejemplo: Documentos clínicos firmados en octubre 2025 de la especialidad Cardiología"
                rows={5}
                className="w-full p-4 border rounded-lg resize-none"
                style={{
                  backgroundColor: "rgb(var(--bg-primary))",
                  color: "rgb(var(--text-primary))",
                  borderColor: "rgb(var(--border-color))",
                }}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Botón generar */}
              <button
                onClick={handleGenerateReport}
                disabled={loading || !queryText.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex-1"
              >
                {loading ? "Generando..." : "Generar Reporte"}
              </button>

              {/* Botón limpiar */}
              <button
                onClick={handleClearQuery}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                disabled={loading}
              >
                Limpiar
              </button>
            </div>

            {/* Configuración */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Formato
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) =>
                    setOutputFormat(
                      e.target.value as "json" | "csv" | "excel" | "pdf"
                    )
                  }
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Límite de filas
                </label>
                <input
                  type="number"
                  value={rowLimit}
                  onChange={(e) => setRowLimit(parseInt(e.target.value) || 100)}
                  min="1"
                  max="1000"
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Motor IA
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) =>
                    setAiProvider(e.target.value as "openai" | "local")
                  }
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                >
                  <option value="local">Local (Reglas)</option>
                  <option value="openai">OpenAI GPT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ejemplos rápidos - Reportes Complejos Validados */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Reportes Disponibles</h3>
            <div className="space-y-2">
              {[
                {
                  label:
                    "Historias clínicas de noviembre ordenadas por paciente",
                  query:
                    "Historias clínicas creadas en noviembre de 2025 ordenadas por paciente",
                },
                {
                  label: "Cantidad de visitas por pacientes en noviembre",
                  query:
                    "Cantidad de visitas por pacientes del mes de noviembre",
                },
                {
                  label: "Historias clínicas tipo AB ordenadas por paciente",
                  query:
                    "Historias clínicas de tipo de sangre AB ordenados por el nombre del paciente",
                },
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQueryText(example.query)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border rounded-lg"
                  disabled={loading}
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {example.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Resultados */}
          {executionResult && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">
                Resultados ({executionResult.result_count} registros en{" "}
                {executionResult.execution_time_ms}ms)
              </h3>

              {executionResult.data && executionResult.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {executionResult.columns.map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {executionResult.data.slice(0, 50).map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {executionResult.columns.map((col) => (
                            <td
                              key={col}
                              className="px-4 py-3 text-sm whitespace-nowrap"
                            >
                              {String(row[col] || "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {executionResult.truncated && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Mostrando primeras 50 filas...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No se encontraron resultados</p>
              )}
            </div>
          )}
        </div>

        {/* Columna lateral - Historial */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Historial Reciente</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {history.length > 0 ? (
                history.map((item) => (
                  <button
                    key={item.query_id}
                    onClick={() => handleLoadFromHistory(item)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    disabled={loading}
                  >
                    <p className="text-sm font-medium line-clamp-2 mb-1">
                      {item.query_text}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{item.executions_count} ejecuciones</span>
                      <span>•</span>
                      <span
                        className={
                          item.status === "validated"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {item.status}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No hay consultas recientes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
