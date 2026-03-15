import React, { memo } from 'react';
import { EvaluationItem } from '../types';
import { MessageSquare } from 'lucide-react';

interface CriteriaRowProps {
  item: EvaluationItem;
  onChange: (id: string, field: keyof EvaluationItem, value: any) => void;
}

const CriteriaRow: React.FC<CriteriaRowProps> = memo(({ item, onChange }) => {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1">
            {item.category}
          </h3>
          <div className="flex items-center gap-3">
             <span className={`text-3xl font-bold font-mono ${getScoreColor(item.score)}`}>
               {item.score}
             </span>
             <span className="text-xs text-slate-500 font-medium">/ 100</span>
          </div>
        </div>
        
        <div className="flex-1 w-full md:w-auto min-w-[200px]">
          <input
            type="range"
            min="0"
            max="100"
            value={item.score}
            onChange={(e) => onChange(item.id, 'score', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
                className={`h-full ${getBarColor(item.score)} transition-all duration-500 ease-out`} 
                style={{ width: `${item.score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute top-3 left-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">
          <MessageSquare size={16} />
        </div>
        <textarea
          value={item.notes}
          onChange={(e) => onChange(item.id, 'notes', e.target.value)}
          placeholder="Observations, détails techniques, bugs rencontrés..."
          className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-lg py-2.5 pl-9 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 min-h-[80px]"
        />
      </div>
    </div>
  );
});

export default CriteriaRow;
