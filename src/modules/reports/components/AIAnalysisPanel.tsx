import { useState } from 'react';
import type { FC } from 'react';
import type {
  AIAnalysisResult,
  AIInsightsResponse,
  AIRecommendation,
  AISummary,
} from '../types';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Lightbulb,
  Loader,
  TrendingUp,
  X,
} from 'lucide-react';

interface AIAnalysisPanelProps {
  insights: AIInsightsResponse;
  isLoading?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Component to display AI analysis results
 * Shows analysis, summary, and recommendations in expandable sections
 */
export const AIAnalysisPanel: FC<AIAnalysisPanelProps> = ({
  insights,
  isLoading = false,
  onClose,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    analysis: true,
    summary: true,
    recommendations: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getPriorityColor = (priority?: string) => {
    const level = priority?.toLowerCase() || 'medium';
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[level] || colors.medium;
  };

  const getPriorityIcon = (priority?: string) => {
    const level = priority?.toLowerCase() || 'medium';
    const icons: Record<string, React.ElementType> = {
      critical: AlertCircle,
      high: TrendingUp,
      medium: Lightbulb,
      low: CheckCircle2,
    };
    const Icon = icons[level] || icons.medium;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">AI Analysis</h3>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Analyzing...</span>
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {/* Analysis Section */}
        {insights.analysis && (
          <AnalysisSection
            analysis={insights.analysis}
            isExpanded={expandedSections.analysis}
            onToggle={() => toggleSection('analysis')}
          />
        )}

        {/* Summary Section */}
        {insights.summary && (
          <SummarySection
            summary={insights.summary}
            isExpanded={expandedSections.summary}
            onToggle={() => toggleSection('summary')}
          />
        )}

        {/* Recommendations Section */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <RecommendationsSection
            recommendations={insights.recommendations}
            isExpanded={expandedSections.recommendations}
            onToggle={() => toggleSection('recommendations')}
            getPriorityColor={getPriorityColor}
            getPriorityIcon={getPriorityIcon}
          />
        )}

        {/* Status Section */}
        {insights.status && (
          <StatusSection
            status={insights.status}
            message={insights.message}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Analysis section with key findings
 */
const AnalysisSection: FC<{
  analysis: AIAnalysisResult;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ analysis, isExpanded, onToggle }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <span className="font-medium text-gray-800">Analysis</span>
        {analysis.confidence_score && (
          <span className="text-sm text-gray-600">
            Confidence: {Math.round(analysis.confidence_score * 100)}%
          </span>
        )}
      </div>
      <div
        className={`transform transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`}
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </button>

    {isExpanded && (
      <div className="px-4 py-3 bg-gray-50 space-y-3">
        {analysis.analysis && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Insights</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {analysis.analysis}
            </p>
          </div>
        )}

        {analysis.key_findings && analysis.key_findings.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Key Findings</h4>
            <ul className="space-y-2">
              {analysis.key_findings.map((finding, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-sm text-gray-700 items-start"
                >
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.generated_at && (
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
            <Clock className="w-3 h-3" />
            Generated: {new Date(analysis.generated_at).toLocaleString()}
          </div>
        )}
      </div>
    )}
  </div>
);

/**
 * Summary section
 */
const SummarySection: FC<{
  summary: AISummary;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ summary, isExpanded, onToggle }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-gray-800">Summary</span>
        {summary.length && (
          <span className="text-sm text-gray-600">
            ({summary.length} words)
          </span>
        )}
      </div>
      <div
        className={`transform transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`}
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </button>

    {isExpanded && (
      <div className="px-4 py-3 bg-gray-50 space-y-3">
        <p className="text-gray-700 text-sm leading-relaxed">
          {summary.summary}
        </p>

        {summary.key_points && summary.key_points.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Key Points</h4>
            <ul className="space-y-2">
              {summary.key_points.map((point, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-sm text-gray-700 items-start"
                >
                  <span className="text-blue-600 mt-1">◆</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary.generated_at && (
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
            <Clock className="w-3 h-3" />
            Generated: {new Date(summary.generated_at).toLocaleString()}
          </div>
        )}
      </div>
    )}
  </div>
);

/**
 * Recommendations section
 */
const RecommendationsSection: FC<{
  recommendations: AIRecommendation[];
  isExpanded: boolean;
  onToggle: () => void;
  getPriorityColor: (priority?: string) => string;
  getPriorityIcon: (priority?: string) => React.ReactNode;
}> = ({
  recommendations,
  isExpanded,
  onToggle,
  getPriorityColor,
  getPriorityIcon,
}) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <span className="font-medium text-gray-800">Recommendations</span>
        <span className="text-sm text-gray-600">
          ({recommendations.length})
        </span>
      </div>
      <div
        className={`transform transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`}
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </button>

    {isExpanded && (
      <div className="px-4 py-3 bg-gray-50 space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={rec.id || `rec-${index}`}
            className={`p-3 rounded-lg border-l-4 ${getPriorityColor(
              rec.priority
            )} bg-white`}
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="mt-1">
                {getPriorityIcon(rec.priority)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {rec.recommendation}
                </p>
                {rec.category && (
                  <p className="text-xs text-gray-600 mt-1">
                    Category: {rec.category}
                  </p>
                )}
              </div>
            </div>

            {rec.action_items && rec.action_items.length > 0 && (
              <div className="mt-2 ml-6 space-y-1">
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Actions:
                </p>
                <ul className="space-y-1">
                  {rec.action_items.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-gray-700 flex gap-2 items-start"
                    >
                      <span className="text-gray-600">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * Status section for pending or error states
 */
const StatusSection: FC<{
  status?: string;
  message?: string;
}> = ({ status, message }) => {
  const isError = status === 'error' || status === 'failed';
  const isPending = status === 'pending' || status === 'processing';

  return (
    <div className={`px-4 py-3 ${isError ? 'bg-red-50' : 'bg-blue-50'}`}>
      <div className="flex items-start gap-2">
        {isPending ? (
          <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <p
            className={`font-semibold ${
              isError
                ? 'text-red-800'
                : isPending
                  ? 'text-blue-800'
                  : 'text-green-800'
            }`}
          >
            {status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : 'Unknown'}
          </p>
          {message && (
            <p
              className={`text-sm mt-1 ${
                isError
                  ? 'text-red-700'
                  : isPending
                    ? 'text-blue-700'
                    : 'text-green-700'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPanel;
