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

          {/* Ejemplos rápidos - 3 TIPOS CRÍTICOS */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Ejemplos de Consultas
              </h3>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded font-semibold">
                3 Tipos Críticos
              </span>
            </div>

            {/* Tipo 1: Historias clínicas por tipo de sangre */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo 1: Historias Clínicas por Tipo de Sangre
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "🅰️ Tipo AB (incluye AB+ y AB-)",
                    query:
                      "Historias clínicas con tipo de sangre AB ordenadas por paciente ascendente",
                  },
                  {
                    label: "🅾️ Tipo O (incluye O+ y O-)",
                    query:
                      "Historias clínicas tipo O ordenadas por paciente descendente",
                  },
                  {
                    label: "🩸 Tipo AB+ específico",
                    query:
                      "Historias clínicas con sangre AB+ ordenadas ascendente",
                  },
                ].map((example, idx) => (
                  <button
                    key={`type1-${idx}`}
                    onClick={() => setQueryText(example.query)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 group"
                    disabled={loading}
                  >
                    <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400 font-medium">
                      {example.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo 2: Historias clínicas por mes */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo 2: Historias Clínicas por Mes de Creación
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "🗓️ Noviembre 2025 ascendente",
                    query:
                      "Historias clínicas creadas en noviembre 2025 ordenadas por paciente ascendente",
                  },
                  {
                    label: "📆 Octubre 2025 descendente",
                    query:
                      "Historias clínicas creadas en octubre 2025 ordenadas descendente",
                  },
                  {
                    label: "📋 Septiembre 2025",
                    query:
                      "Historias clínicas de septiembre 2025 ordenadas por paciente",
                  },
                ].map((example, idx) => (
                  <button
                    key={`type2-${idx}`}
                    onClick={() => setQueryText(example.query)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 group"
                    disabled={loading}
                  >
                    <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 font-medium">
                      {example.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo 3: Cantidad de visitas (formularios) por paciente */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo 3: Cantidad de Visitas al Hospital (Formularios)
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "📊 Visitas en noviembre 2025",
                    query:
                      "Cantidad de veces que cada paciente asistió a la clínica en noviembre 2025",
                  },
                  {
                    label: "🔢 Formularios por paciente octubre",
                    query:
                      "Cantidad de formularios por paciente en octubre 2025 ordenados ascendente",
                  },
                  {
                    label: "📈 Visitas todo 2025",
                    query:
                      "Cantidad de formularios clínicos por paciente en 2025",
                  },
                ].map((example, idx) => (
                  <button
                    key={`type3-${idx}`}
                    onClick={() => setQueryText(example.query)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 group"
                    disabled={loading}
                  >
                    <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-400 font-medium">
                      {example.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tip con explicación */}
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-xs text-green-800 dark:text-green-300 mb-1">
                <strong>💡 3 Tipos de Informes Soportados:</strong>
              </p>
              <ul className="text-xs text-green-800 dark:text-green-300 space-y-1 ml-4 list-disc">
                <li>
                  <strong>Tipo 1:</strong> Filtra historias por tipo de sangre
                  (AB, O, A, B) con +/-
                </li>
                <li>
                  <strong>Tipo 2:</strong> Filtra historias por mes de creación
                  (sept, oct, nov, etc.)
                </li>
                <li>
                  <strong>Tipo 3:</strong> Cuenta visitas (formularios clínicos)
                  por paciente en un período
                </li>
              </ul>
              <p className="text-xs text-green-700 dark:text-green-400 mt-2 font-semibold">
                ✅ Todos soportan ordenamiento ascendente o descendente
              </p>
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
