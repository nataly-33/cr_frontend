import { useState } from "react";
import { toast } from "react-toastify";
import { reportsService } from "../services";

interface Filter {
  field: string;
  operator: string;
  value: string | number;
}

interface ReportConfig {
  model: string;
  filters: Filter[];
  fields: string[];
  order_by: string;
  limit: number;
  export_format: "json" | "pdf" | "excel" | "csv";
}

const MODELS = {
  patient: {
    name: "Pacientes",
    fields: [
      "identity_document_type",
      "identity_document",
      "first_name",
      "last_name",
      "date_of_birth",
      "gender",
      "phone",
      "email",
      "address",
      "city",
      "created_at",
      "updated_at",
    ],
    filters: [
      "first_name",
      "last_name",
      "email",
      "gender",
      "city",
      "created_at",
    ],
  },
  clinical_record: {
    name: "Historias Clínicas",
    fields: [
      "record_number",
      "status",
      "blood_type",
      "family_history",
      "social_history",
      // ⭐ CAMPOS RELACIONADOS (JOINs automáticos)
      "patient_name",
      "patient_document",
      "patient_email",
      "created_by_name",
      "created_at",
      "updated_at",
    ],
    filters: [
      "record_number",
      "status",
      "blood_type",
      "patient_name",
      "created_at",
    ],
  },
  clinical_form: {
    name: "Formularios Clínicos",
    fields: [
      "form_type",
      "doctor_name",
      "doctor_specialty",
      "form_date",
      // ⭐ CAMPOS RELACIONADOS (JOINs automáticos)
      "clinical_record_number",
      "patient_name",
      "patient_document",
      "filled_by_name",
      "created_at",
      "updated_at",
    ],
    filters: [
      "form_type",
      "doctor_name",
      "patient_name",
      "form_date",
      "created_at",
    ],
  },
  document: {
    name: "Documentos Clínicos",
    fields: [
      "document_type",
      "title",
      "description",
      "document_date",
      "specialty",
      "doctor_name",
      "doctor_license",
      "file_name",
      "file_size_bytes",
      "mime_type",
      "ocr_processed",
      "ocr_confidence",
      "ocr_status",
      "is_signed",
      "is_locked",
      // ⭐ CAMPOS RELACIONADOS (JOINs automáticos)
      "clinical_record_number",
      "patient_name",
      "patient_document",
      "created_by_name",
      "created_at",
      "updated_at",
    ],
    filters: [
      "document_type",
      "patient_name",
      "doctor_name",
      "ocr_processed",
      "is_signed",
      "created_at",
    ],
  },
  user: {
    name: "Usuarios",
    fields: [
      "email",
      "username",
      "first_name",
      "last_name",
      "phone",
      "gender",
      "birth_date",
      "professional_id",
      "specialty",
      "is_active",
      "is_staff",
      "email_verified",
      // ⭐ CAMPO RELACIONADO (JOIN automático)
      "tenant_name",
      "created_at",
      "updated_at",
    ],
    filters: [
      "email",
      "first_name",
      "last_name",
      "specialty",
      "is_active",
      "created_at",
    ],
  },
  audit_log: {
    name: "Logs de Auditoría",
    fields: [
      "action_type",
      "resource_type",
      "resource_id",
      "resource_name",
      // ⭐ CAMPOS RELACIONADOS (JOINs automáticos)
      "user_email",
      "user_name",
      "ip_address",
      "user_agent",
      "request_method",
      "request_path",
      "response_status",
      "timestamp",
    ],
    filters: ["action_type", "resource_type", "user_email", "timestamp"],
  },
};

const OPERATORS = {
  equals: "Igual a",
  contains: "Contiene",
  starts_with: "Empieza con",
  ends_with: "Termina con",
  gt: "Mayor que",
  gte: "Mayor o igual",
  lt: "Menor que",
  lte: "Menor o igual",
  in: "En lista",
  is_null: "Es nulo",
};

export const ReportsPage = () => {
  const [config, setConfig] = useState<ReportConfig>({
    model: "patient",
    filters: [],
    fields: [],
    order_by: "-created_at",
    limit: 100,
    export_format: "json",
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const addFilter = () => {
    setConfig({
      ...config,
      filters: [
        ...config.filters,
        { field: "", operator: "equals", value: "" },
      ],
    });
  };

  const updateFilter = (index: number, key: keyof Filter, value: any) => {
    const newFilters = [...config.filters];
    newFilters[index] = { ...newFilters[index], [key]: value };
    setConfig({ ...config, filters: newFilters });
  };

  const removeFilter = (index: number) => {
    setConfig({
      ...config,
      filters: config.filters.filter((_, i) => i !== index),
    });
  };

  const toggleField = (field: string) => {
    if (config.fields.includes(field)) {
      setConfig({
        ...config,
        fields: config.fields.filter((f) => f !== field),
      });
    } else {
      setConfig({ ...config, fields: [...config.fields, field] });
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await reportsService.generateDynamic(config);

      if (config.export_format === "json") {
        setResults(response);
        toast.success("Reporte generado exitosamente");
      } else {
        // Descargar archivo
        const blob = new Blob([response]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Determinar la extensión correcta del archivo
        const fileExtension =
          config.export_format === "excel" ? "xlsx" : config.export_format;
        a.download = `reporte_${
          config.model
        }_${new Date().getTime()}.${fileExtension}`;

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Reporte descargado exitosamente");
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(error.response?.data?.error || "Error al generar reporte");
    } finally {
      setLoading(false);
    }
  };

  const modelData = MODELS[config.model as keyof typeof MODELS];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: "rgb(var(--text-primary))" }}
      >
        Reportes Dinámicos
      </h1>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Configuración del Reporte
        </h2>

        {/* Selector de Modelo */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            ¿Qué deseas reportar?
          </label>
          <select
            value={config.model}
            onChange={(e) =>
              setConfig({
                ...config,
                model: e.target.value,
                fields: [],
                filters: [],
              })
            }
            className="w-full p-3 border rounded-lg"
            style={{
              backgroundColor: "rgb(var(--bg-primary))",
              color: "rgb(var(--text-primary))",
              borderColor: "rgb(var(--border-color))",
            }}
          >
            {Object.entries(MODELS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">Filtros</label>
            <button
              onClick={addFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Agregar Filtro
            </button>
          </div>

          {config.filters.map((filter, index) => (
            <div key={index} className="flex gap-3 mb-3">
              <select
                value={filter.field}
                onChange={(e) => updateFilter(index, "field", e.target.value)}
                className="flex-1 p-2 border rounded-lg"
                style={{
                  backgroundColor: "rgb(var(--bg-primary))",
                  color: "rgb(var(--text-primary))",
                  borderColor: "rgb(var(--border-color))",
                }}
              >
                <option value="">Seleccionar campo</option>
                {modelData.filters.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>

              <select
                value={filter.operator}
                onChange={(e) =>
                  updateFilter(index, "operator", e.target.value)
                }
                className="flex-1 p-2 border rounded-lg"
                style={{
                  backgroundColor: "rgb(var(--bg-primary))",
                  color: "rgb(var(--text-primary))",
                  borderColor: "rgb(var(--border-color))",
                }}
              >
                {Object.entries(OPERATORS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(index, "value", e.target.value)}
                placeholder="Valor"
                className="flex-1 p-2 border rounded-lg"
                style={{
                  backgroundColor: "rgb(var(--bg-primary))",
                  color: "rgb(var(--text-primary))",
                  borderColor: "rgb(var(--border-color))",
                }}
              />

              <button
                onClick={() => removeFilter(index)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          ))}

          {config.filters.length === 0 && (
            <p
              className="text-sm"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              Sin filtros. Se incluirán todos los registros.
            </p>
          )}
        </div>

        {/* Campos a incluir */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Campos a incluir
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {modelData.fields.map((field) => (
              <label
                key={field}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={config.fields.includes(field)}
                  onChange={() => toggleField(field)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{field}</span>
              </label>
            ))}
          </div>
          {config.fields.length === 0 && (
            <p
              className="text-sm mt-2"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              Si no seleccionas campos, se incluirán todos.
            </p>
          )}
        </div>

        {/* Ordenamiento */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Ordenar por</label>
          <select
            value={config.order_by}
            onChange={(e) => setConfig({ ...config, order_by: e.target.value })}
            className="w-full p-3 border rounded-lg"
            style={{
              backgroundColor: "rgb(var(--bg-primary))",
              color: "rgb(var(--text-primary))",
              borderColor: "rgb(var(--border-color))",
            }}
          >
            <option value="-created_at">Más recientes primero</option>
            <option value="created_at">Más antiguos primero</option>
            {modelData.fields.map((field) => [
              <option key={`${field}-asc`} value={field}>
                {field} (A-Z)
              </option>,
              <option key={`${field}-desc`} value={`-${field}`}>
                {field} (Z-A)
              </option>,
            ])}
          </select>
        </div>

        {/* Límite */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Límite de registros
          </label>
          <input
            type="number"
            value={config.limit}
            onChange={(e) =>
              setConfig({ ...config, limit: parseInt(e.target.value) })
            }
            min="1"
            max="10000"
            className="w-full p-3 border rounded-lg"
            style={{
              backgroundColor: "rgb(var(--bg-primary))",
              color: "rgb(var(--text-primary))",
              borderColor: "rgb(var(--border-color))",
            }}
          />
        </div>

        {/* Formato de exportación */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Formato de exportación
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["json", "pdf", "excel", "csv"] as const).map((format) => (
              <button
                key={format}
                onClick={() => setConfig({ ...config, export_format: format })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  config.export_format === format
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <span className="text-sm font-medium uppercase">{format}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Botón Generar */}
        <button
          onClick={generateReport}
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? "Generando..." : "Generar Reporte"}
        </button>
      </div>

      {/* Resultados */}
      {results && config.export_format === "json" && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Resultados</h2>
          <div className="mb-4">
            <p
              className="text-sm"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              <strong>Total de registros:</strong>{" "}
              {results.metadata?.total_records || results.total_records}
            </p>
            <p
              className="text-sm"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              <strong>Generado:</strong>{" "}
              {new Date(
                results.metadata?.generated_at || results.generated_at
              ).toLocaleString()}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {results.fields.map((field: string) => (
                    <th
                      key={field}
                      className="p-2 border text-left text-sm font-medium"
                    >
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.data.map((row: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {results.fields.map((field: string) => (
                      <td key={field} className="p-2 border text-sm">
                        {typeof row[field] === "object"
                          ? JSON.stringify(row[field])
                          : String(row[field] || "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
