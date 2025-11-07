import { useEffect, useState } from "react";
import { paymentService, type Payment, type Invoice } from "../services/payment.service";
import { Button } from "@shared/components/ui/Button";
import { Card } from "@shared/components/ui/Card";
import { toast } from "react-toastify";
import { Loader2, Download, Eye } from "lucide-react";

export const PaymentHistoryPage = () => {
  const [activeTab, setActiveTab] = useState<"payments" | "invoices">("payments");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "payments") {
        const data = await paymentService.getPayments({
          page,
          page_size: 10,
        });
        setPayments(data.results);
      } else {
        const data = await paymentService.getInvoices({
          page,
          page_size: 10,
        });
        setInvoices(data.results);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
      cancelled: "bg-gray-100 text-gray-800",
      paid: "bg-green-100 text-green-800",
      issued: "bg-blue-100 text-blue-800",
      sent: "bg-blue-100 text-blue-800",
      draft: "bg-gray-100 text-gray-800",
      overdue: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const invoice = await paymentService.getInvoiceById(invoiceId);
      if (invoice.pdf_url) {
        window.open(invoice.pdf_url, "_blank");
      } else {
        toast.error("No hay PDF disponible para esta factura");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Error al descargar la factura");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Historial de Pagos</h1>
        <p className="text-gray-600">
          Visualiza tu historial de pagos e invoices
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("payments");
            setPage(1);
          }}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === "payments"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pagos
        </button>
        <button
          onClick={() => {
            setActiveTab("invoices");
            setPage(1);
          }}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === "invoices"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Facturas
        </button>
      </div>

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Historial de Pagos</h2>
            <p className="text-sm text-gray-600 mb-6">Todos tus pagos realizados</p>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay pagos registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Plan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Monto</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Moneda</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{payment.subscription_plan_name}</td>
                        <td className="py-3 px-4 font-semibold">${payment.amount}</td>
                        <td className="py-3 px-4">{payment.currency}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                              payment.status
                            )}`}
                          >
                            {payment.status_display}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button size="sm" variant="ghost" className="text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Facturas</h2>
            <p className="text-sm text-gray-600 mb-6">Todas tus facturas emitidas</p>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay facturas registradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Número de Factura</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Plan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Moneda</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{invoice.invoice_number}</td>
                        <td className="py-3 px-4">{invoice.subscription_plan_name}</td>
                        <td className="py-3 px-4">
                          {new Date(invoice.issue_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold">${invoice.total}</td>
                        <td className="py-3 px-4">{invoice.currency}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status_display}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            disabled={!invoice.pdf_url}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
