import React, { useState } from 'react';
import { AnalysisData } from '../types';
import { BarChart2, CheckCircle, LinkIcon, FileText, ArrowRight, Copy, PenTool, CheckCircle as SaveIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

interface AnalysisViewProps {
  data: AnalysisData;
  onGenerate: () => void;
  onOutlineChange: (newOutline: string) => void;
  isGenerating: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, onGenerate, onOutlineChange, isGenerating }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [outlineBuffer, setOutlineBuffer] = useState(data.suggestedOutline);
  const [copied, setCopied] = useState(false);

  const handleSaveOutline = () => {
    onOutlineChange(outlineBuffer);
    setIsEditing(false);
  };

  const handleCopyOutline = () => {
    navigator.clipboard.writeText(data.suggestedOutline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyOutline}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Copy Outline"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-xs font-medium px-2 py-1 rounded border transition-colors flex items-center gap-1
                    ${isEditing 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {isEditing ? 'Cancel' : 'Edit Outline'}
                </button>
                {isEditing && (
                  <button 
                    onClick={handleSaveOutline}
                    className="text-xs font-medium px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 flex items-center gap-1"
                  >
                    <SaveIcon className="w-3 h-3" /> Save
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6 flex-grow">
              {isEditing ? (
                <textarea
                  value={outlineBuffer}
                  onChange={(e) => setOutlineBuffer(e.target.value)}
                  className="w-full h-96 p-4 text-sm font-mono text-slate-700 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              ) : (
                 <div className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600">
                    <ReactMarkdown>{data.suggestedOutline}</ReactMarkdown>
                 </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/30">
              <button
                onClick={onGenerate}
                disabled={isGenerating || isEditing}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
                  ${isGenerating || isEditing
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.01]'}`}
              >
                {isGenerating ? (
                  <>Writing Article...</>
                ) : (
                  <>Generate Full Article <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              {isEditing && <p className="text-center text-xs text-amber-600 mt-2">Please save your outline changes before generating.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisView;
