import React from 'react';
import { AnalysisData } from '../types';
import { BarChart2, CheckCircle, LinkIcon, FileText, ArrowRight } from './Icons';
import ReactMarkdown from 'react-markdown';

interface AnalysisViewProps {
  data: AnalysisData;
  onGenerate: () => void;
  isGenerating: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, onGenerate, isGenerating }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Difficulty */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <BarChart2 className="w-4 h-4" />
            <span className="text-sm font-medium">Difficulty</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold 
              ${data.difficulty === 'High' ? 'text-red-600' : 
                data.difficulty === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
              {data.difficulty}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{data.difficultyReason}</p>
        </div>

        {/* Keywords */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 text-slate-500 mb-3">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Keywords Strategy</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.relatedKeywords.map((kw, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: References & Outline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: References & Competitor Topics */}
        <div className="space-y-6">
          {/* Competitor Topics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Competitor Angles</h3>
            <ul className="space-y-2">
              {data.competitorTopics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>

           {/* Grounding Sources */}
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> AI Research Sources
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {data.groundingSources.length > 0 ? (
                data.groundingSources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors group"
                  >
                    <p className="text-xs font-medium text-slate-700 group-hover:text-blue-600 line-clamp-2 mb-1">
                      {source.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{source.uri}</p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No specific sources cited.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Outline & Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">Proposed Content Outline</h3>
              </div>
            </div>
            <div className="p-6 prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 flex-grow">
               <ReactMarkdown>{data.suggestedOutline}</ReactMarkdown>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50/30">
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
                  ${isGenerating 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.01]'}`}
              >
                {isGenerating ? (
                  <>Writing Article...</>
                ) : (
                  <>Generate Full Article <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisView;
