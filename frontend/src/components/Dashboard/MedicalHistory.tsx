import React from 'react';

interface MedicalRecord {
  date: string;
  symptoms: string[];
  ai_diagnosis: string;
  confidence: number;
  recommended_action?: string;
  language: string;
}

interface MedicalHistoryProps {
  records: MedicalRecord[];
  loading: boolean;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ records, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-4 h-24" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📋</div>
        <h3 className="font-medium text-gray-600">No medical records yet</h3>
        <p className="text-sm text-gray-400 mt-1">
          Your chatbot consultations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {records.map((record, idx) => {
        const date = new Date(record.date);
        const confidencePercent = Math.round(record.confidence * 100);
        const confidenceColor =
          confidencePercent >= 75
            ? 'text-emerald-600 bg-emerald-50'
            : confidencePercent >= 50
            ? 'text-amber-600 bg-amber-50'
            : 'text-red-600 bg-red-50';

        return (
          <div
            key={idx}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                📅 {date.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceColor}`}
              >
                {confidencePercent}% confidence
              </span>
            </div>

            {/* Symptoms */}
            <div className="flex flex-wrap gap-1 mb-2">
              {record.symptoms.map((s, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Diagnosis */}
            <p className="text-sm font-medium text-gray-800">
              🩺 {record.ai_diagnosis}
            </p>

            {/* Action */}
            {record.recommended_action && (
              <p className="text-xs text-gray-500 mt-1">
                💡 {record.recommended_action}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MedicalHistory;
