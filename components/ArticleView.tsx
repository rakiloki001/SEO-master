import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, CheckCircle, RefreshCw, PenTool, Loader2, LinkIcon as ImageIcon, ArrowRight } from './Icons';
import { GeneratedImage } from '../types';

interface ArticleViewProps {
  content: string;
  images: GeneratedImage[];
  onReset: () => void;
  onGenerateImages: () => void;
  isGeneratingImages: boolean;
}

const ArticleView: React.FC<ArticleViewProps> = ({ 
  content, 
  images, 
  onReset, 
  onGenerateImages, 
  isGeneratingImages 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-article.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* Article Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm flex-wrap gap-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <PenTool className="w-5 h-5 text-green-600" />
            <span>Final Article</span>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Download .md
            </button>
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
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
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

      {/* Image Generation Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Recommended Images
          </h3>
          {images.length === 0 && (
            <button
              onClick={onGenerateImages}
              disabled={isGeneratingImages}
              className={`px-4 py-2 rounded-lg font-medium text-white text-sm transition-all flex items-center gap-2
                ${isGeneratingImages 
                  ? 'bg-purple-300 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-md'}`}
            >
              {isGeneratingImages ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing & Generating...</>
              ) : (
                <>Analyze & Generate Images <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>

        {images.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {images.map((img, idx) => (
               <div key={idx} className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                 <img 
                   src={img.url} 
                   alt={`Generated result for ${img.prompt}`} 
                   className="w-full h-64 object-cover"
                 />
                 <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                   <p className="text-white text-xs line-clamp-2">{img.prompt}</p>
                 </div>
                 <a 
                   href={img.url} 
                   download={`seo-image-${idx+1}.png`}
                   className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                   title="Download Image"
                 >
                   <ArrowRight className="w-4 h-4 rotate-90" />
                 </a>
               </div>
             ))}
           </div>
        ) : (
          !isGeneratingImages && (
            <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No images generated yet.</p>
              <p className="text-slate-400 text-xs mt-1">Click the button above to analyze content and create 2 relevant visuals.</p>
            </div>
          )
        )}
      </div>
      
    </div>
  );
};

export default ArticleView;
