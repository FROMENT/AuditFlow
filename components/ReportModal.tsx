import React from 'react';
import { GeminiReport } from '../types';
import { X, CheckCircle, AlertTriangle, ShieldAlert, Award } from 'lucide-react';

interface ReportModalProps {
  report: GeminiReport | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ report, isOpen, onClose }) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="text-yellow-500" /> 
              Rapport d'Audit Généré
            </h2>
            <p className="text-slate-400 text-sm mt-1">Généré par Gemini 3 Flash</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Executive Summary */}
          <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">Résumé Exécutif</h3>
            <p className="text-slate-300 leading-relaxed">{report.executiveSummary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-4">
               <h3 className="flex items-center gap-2 text-green-400 font-semibold text-lg">
                 <CheckCircle size={20} /> Points Forts
               </h3>
               <ul className="space-y-3">
                 {report.strengths.map((s, i) => (
                   <li key={i} className="flex gap-3 text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                     <span className="text-green-500 font-bold">•</span>
                     {s}
                   </li>
                 ))}
               </ul>
            </div>

            {/* Weaknesses */}
            <div className="space-y-4">
               <h3 className="flex items-center gap-2 text-red-400 font-semibold text-lg">
                 <AlertTriangle size={20} /> Points d'Amélioration
               </h3>
               <ul className="space-y-3">
                 {report.weaknesses.map((w, i) => (
                   <li key={i} className="flex gap-3 text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                     <span className="text-red-500 font-bold">•</span>
                     {w}
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="flex items-center gap-2 text-blue-400 font-semibold text-lg mb-4">
              <ShieldAlert size={20} /> Recommandations Prioritaires
            </h3>
            <div className="grid gap-4">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg flex gap-4 items-start">
                  <div className="bg-blue-500/20 text-blue-400 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-slate-300 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final Verdict */}
          <div className="border-t border-slate-800 pt-6 mt-6">
            <h4 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Verdict Final</h4>
            <p className="text-xl font-medium text-white italic">"{report.finalVerdict}"</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 sticky bottom-0">
          <button onClick={onClose} className="px-5 py-2 text-slate-300 hover:text-white transition-colors">
            Fermer
          </button>
          <button 
            onClick={() => window.print()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            Imprimer / PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
