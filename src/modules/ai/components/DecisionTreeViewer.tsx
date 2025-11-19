import React, { useState, useEffect } from 'react';
import { GitBranch, Info, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { diabetesService } from '../services/diabetes.service';
import type { TreeRule } from '../types';

const DecisionTreeViewer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rulesData, setRulesData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'visualization' | 'rules' | 'importance'>('visualization');
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set([0, 1, 2]));

  const treeImageUrl = diabetesService.getTreeVisualizationUrl();
  const featureImportanceUrl = diabetesService.getFeatureImportanceUrl();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await diabetesService.getTreeRules();
      setRulesData(response.data);
    } catch (err) {
      setError('Error al cargar las reglas del árbol');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = (index: number) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRules(newExpanded);
  };

  const getRiskColor = (prediction: string) => {
    return prediction === 'Con Riesgo' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Cargando visualización del árbol...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <GitBranch className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Árbol de Decisión</h2>
            <p className="text-gray-600 mt-1">
              Visualización del modelo de machine learning para predicción de diabetes
            </p>
            {rulesData && (
              <div className="flex gap-6 mt-4 text-sm">
                <div>
                  <span className="text-gray-500">Versión:</span>{' '}
                  <span className="font-semibold">{rulesData.model_version}</span>
                </div>
                <div>
                  <span className="text-gray-500">Accuracy:</span>{' '}
                  <span className="font-semibold">{(rulesData.accuracy * 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Profundidad:</span>{' '}
                  <span className="font-semibold">{rulesData.tree_depth}</span>
                </div>
                <div>
                  <span className="text-gray-500">Hojas:</span>{' '}
                  <span className="font-semibold">{rulesData.n_leaves}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('visualization')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'visualization'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <GitBranch className="w-4 h-4 inline mr-2" />
              Visualización del Árbol
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'rules'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              Reglas de Decisión
            </button>
            <button
              onClick={() => setActiveTab('importance')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'importance'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Importancia de Características
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Visualization Tab */}
          {activeTab === 'visualization' && (
            <div>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Cómo interpretar el árbol:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Cada nodo muestra una condición de decisión</li>
                      <li>Los colores indican la clase mayoritaria (naranja = riesgo, azul = sin riesgo)</li>
                      <li>La intensidad del color representa la confianza de la predicción</li>
                      <li>Los valores en cada nodo muestran: [muestras sin riesgo, muestras con riesgo]</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-auto bg-gray-50">
                <img
                  src={treeImageUrl}
                  alt="Árbol de Decisión"
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><text x="50%" y="50%" text-anchor="middle">Error al cargar imagen</text></svg>';
                  }}
                />
              </div>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && rulesData && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-semibold mb-1">Reglas más importantes del modelo</p>
                    <p className="text-yellow-800">
                      Estas son las 10 reglas con mayor confianza que el modelo utiliza para clasificar pacientes.
                      Cada regla muestra las condiciones que deben cumplirse y la predicción resultante.
                    </p>
                  </div>
                </div>
              </div>

              {rulesData.interpretable_rules.map((rule: TreeRule, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                >
                  <button
                    onClick={() => toggleRule(index)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedRules.has(index) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Regla #{index + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getRiskColor(rule.prediction)}`}>
                            {rule.prediction}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Confianza: {(rule.confidence * 100).toFixed(1)}% | {rule.samples} muestras | Profundidad: {rule.depth}
                        </div>
                      </div>
                    </div>
                  </button>

                  {expandedRules.has(index) && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-3">Condiciones:</h4>
                      <div className="space-y-1">
                        {rule.conditions.map((condition, condIndex) => (
                          <div
                            key={condIndex}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-blue-600 font-mono">→</span>
                            <span className="text-gray-700">{condition}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Entonces:</span>{' '}
                          <span className={`font-semibold ${rule.prediction === 'Con Riesgo' ? 'text-red-600' : 'text-green-600'}`}>
                            {rule.prediction} de diabetes
                          </span>
                          {' '}con {(rule.confidence * 100).toFixed(1)}% de confianza
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Feature Importance Tab */}
          {activeTab === 'importance' && (
            <div>
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="font-semibold mb-1">Importancia de las características</p>
                    <p className="text-green-800">
                      Este gráfico muestra qué características tienen mayor peso en las decisiones del modelo.
                      Las características más importantes son las que más contribuyen a la predicción.
                    </p>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <img
                  src={featureImportanceUrl}
                  alt="Importancia de Características"
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><text x="50%" y="50%" text-anchor="middle">Error al cargar imagen</text></svg>';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionTreeViewer;
