import React, { useState, useCallback, useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, Search, Globe, Cpu, Sparkles, FileText, ChevronRight, Loader2, Link as LinkIcon, Zap, Accessibility, ShieldCheck, BarChart3 
} from 'lucide-react';
import { Category, EvaluationItem, AuditState, GeminiReport } from './types';
import * as GeminiService from './services/geminiService';
import * as PageSpeedService from './services/pagespeedService';
import CriteriaRow from './components/CriteriaRow';
import ReportModal from './components/ReportModal';

// Initial state creator
const createInitialItems = (): EvaluationItem[] => [
  { id: '1', category: Category.DESIGN, score: 70, notes: '' },
  { id: '2', category: Category.CONTENT, score: 60, notes: '' },
  { id: '3', category: Category.PERFORMANCE, score: 85, notes: '' },
  { id: '4', category: Category.SEO, score: 50, notes: '' },
  { id: '5', category: Category.ACCESSIBILITY, score: 40, notes: '' },
  { id: '6', category: Category.SECURITY, score: 60, notes: '' },
];

const App: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [auditState, setAuditState] = useState<AuditState>({
    items: createInitialItems(),
    metadata: null,
    overallScore: 61,
  });

  const [generatedReport, setGeneratedReport] = useState<GeminiReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handlers
  const handleScoreChange = useCallback((id: string, field: keyof EvaluationItem, value: any) => {
    setAuditState(prev => {
      const newItems = prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      
      const total = newItems.reduce((acc, curr) => acc + curr.score, 0);
      const avg = Math.round(total / newItems.length);

      return {
        ...prev,
        items: newItems,
        overallScore: avg
      };
    });
  }, []);

  const handleScanUrl = async () => {
    if (!urlInput) return;
    setIsScanning(true);
    try {
      // Run both in parallel, but handle PageSpeed separately so it doesn't block Gemini
      const [metaResult, performanceResult] = await Promise.allSettled([
        GeminiService.scanWebsiteUrl(urlInput),
        PageSpeedService.fetchPageSpeedMetrics(urlInput)
      ]);
      
      let metadata = null;
      if (metaResult.status === 'fulfilled') {
        metadata = { ...metaResult.value, url: urlInput };
      } else {
        throw new Error("Erreur lors du scan de l'URL.");
      }

      if (performanceResult.status === 'fulfilled') {
        metadata.performance = performanceResult.value;
      }
      
      setAuditState(prev => ({
        ...prev,
        metadata
      }));
    } catch (err) {
      if (err instanceof Error && err.message !== 'QUOTA_EXCEEDED') {
        alert(err.message || "Erreur lors du scan de l'URL.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const report = await GeminiService.generateAuditReport(auditState);
      setGeneratedReport(report);
      setIsModalOpen(true);
    } catch (err) {
      alert("Erreur lors de la génération du rapport.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Memoized Chart Data
  const chartData = useMemo(() => {
    return auditState.items.map(item => ({
      subject: item.category,
      A: item.score,
      fullMark: 100,
    }));
  }, [auditState.items]);

  // Visual helpers for score coloring
  const getScoreColorHex = (score: number) => {
    if (score > 75) return '#4ade80'; // tailwind green-400
    if (score > 50) return '#facc15'; // tailwind yellow-400
    return '#f87171'; // tailwind red-400
  };
  
  const getScoreTextColor = (score: number) => {
     if (score > 75) return 'text-green-400';
     if (score > 50) return 'text-yellow-400';
     return 'text-red-400';
  };

  // Circular progress math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (auditState.overallScore / 100) * circumference;
  const activeColor = getScoreColorHex(auditState.overallScore);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 rounded-lg">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">AuditFlow<span className="text-blue-500">.ai</span></span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-white cursor-pointer transition-colors">Historique</span>
            <div className="w-8 h-8 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-xs">
              JD
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* URL Input Section */}
            <div className="bg-slate-850 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe size={18} className="text-blue-400"/> Cible de l'audit
              </h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                    placeholder="https://www.exemple.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleScanUrl}
                  disabled={isScanning || !urlInput}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                  {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  <span className="hidden sm:inline">Analyser</span>
                </button>
              </div>

              {/* AI Scanned Metadata */}
              {auditState.metadata && (
                <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-500">
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">Analyse IA Rapide</h3>
                  <p className="text-sm text-slate-400 mb-3">{auditState.metadata.summary}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {auditState.metadata.techStack.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 flex items-center gap-1">
                        <Cpu size={10} /> {tech}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-1">
                    {auditState.metadata.initialImpressions.map((imp, i) => (
                      <div key={i} className="flex gap-2 items-start text-xs text-slate-500">
                        <span className="text-blue-500 mt-0.5">•</span> {imp}
                      </div>
                    ))}
                  </div>

                  {/* Grounding Sources */}
                  {auditState.metadata.sources && auditState.metadata.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><LinkIcon size={10} /> Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {auditState.metadata.sources.map((s, i) => (
                           <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline truncate max-w-[200px] block">
                             {s.title || new URL(s.uri).hostname}
                           </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PageSpeed Metrics */}
                  {auditState.metadata.performance && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2"><BarChart3 size={12} /> Scores PageSpeed (Mobile)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <p className="text-[10px] text-slate-500 flex items-center gap-1"><Zap size={10} className="text-yellow-400"/> Perf</p>
                          <p className="text-lg font-bold text-white">{auditState.metadata.performance.performance}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <p className="text-[10px] text-slate-500 flex items-center gap-1"><Accessibility size={10} className="text-green-400"/> Access</p>
                          <p className="text-lg font-bold text-white">{auditState.metadata.performance.accessibility}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <p className="text-[10px] text-slate-500 flex items-center gap-1"><ShieldCheck size={10} className="text-blue-400"/> Best</p>
                          <p className="text-lg font-bold text-white">{auditState.metadata.performance.bestPractices}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <p className="text-[10px] text-slate-500 flex items-center gap-1"><Search size={10} className="text-purple-400"/> SEO</p>
                          <p className="text-lg font-bold text-white">{auditState.metadata.performance.seo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Evaluation Criteria Form */}
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                 <h2 className="text-lg font-semibold text-white">Critères d'évaluation</h2>
                 <span className="text-xs text-slate-500 uppercase tracking-wider">Manuel</span>
              </div>
              
              {auditState.items.map(item => (
                <CriteriaRow 
                  key={item.id} 
                  item={item} 
                  onChange={handleScoreChange} 
                />
              ))}
            </div>

          </div>

          {/* Right Column: Visualization & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Score Card */}
            <div className="bg-slate-850 rounded-2xl p-6 border border-slate-800 shadow-xl sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Score Global</h2>
                  <p className="text-xs text-slate-400 mt-1">Moyenne pondérée</p>
                </div>
                
                {/* Circular Progress Gauge */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle
                       cx="48"
                       cy="48"
                       r={radius}
                       stroke="currentColor"
                       strokeWidth="8"
                       fill="transparent"
                       className="text-slate-800"
                     />
                     <circle
                       cx="48"
                       cy="48"
                       r={radius}
                       stroke={activeColor}
                       strokeWidth="8"
                       fill="transparent"
                       strokeDasharray={circumference}
                       strokeDashoffset={strokeDashoffset}
                       strokeLinecap="round"
                       className="transition-all duration-1000 ease-out"
                       style={{ filter: `drop-shadow(0 0 4px ${activeColor}40)` }}
                     />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className={`text-2xl font-bold font-mono ${getScoreTextColor(auditState.overallScore)}`}>
                       {auditState.overallScore}
                     </span>
                     <span className="text-[10px] text-slate-500 font-medium">/ 100</span>
                   </div>
                </div>
              </div>

              {/* Chart */}
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%" style={{ minHeight: '300px' }}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Site"
                      dataKey="A"
                      stroke={activeColor}
                      strokeWidth={3}
                      fill={activeColor}
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Action */}
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || !auditState.metadata}
                className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Rédaction en cours...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Générer le Rapport Final
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </button>
              
              {!auditState.metadata && (
                <p className="text-xs text-center text-slate-500 mt-3">
                  Veuillez d'abord scanner une URL pour activer la génération.
                </p>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Result Modal */}
      <ReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        report={generatedReport} 
      />
      
    </div>
  );
};

export default App;