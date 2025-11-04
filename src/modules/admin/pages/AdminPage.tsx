import { useState } from "react";
import { Shield, Lock } from "lucide-react";
import { RolesManagement } from "../components/RolesManagement";
import { PermissionsManagement } from "../components/PermissionsManagement";

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administración</h1>
              <p className="text-gray-500 mt-1">Gestiona roles y permisos del sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                activeTab === "roles"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={18} />
                Roles
              </div>
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                activeTab === "permissions"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock size={18} />
                Permisos
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "roles" && <RolesManagement />}
        {activeTab === "permissions" && <PermissionsManagement />}
      </div>
    </div>
  );
};

export default AdminPage;
