import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, CheckCircle, RefreshCw, PenTool } from './Icons';

interface ArticleViewProps {
  content: string;
  onReset: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ content, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <PenTool className="w-5 h-5 text-green-600" />
            <span>Final Article</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border
                ${copied 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Start New
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-12 prose prose-slate max-w-none prose-lg prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-blue-600 prose-img:rounded-xl">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
      
      <div className="text-center mt-8 pb-8">
         <p className="text-slate-400 text-sm">Generated content should be reviewed for accuracy before publishing.</p>
      </div>
    </div>
  );
};

export default ArticleView;
