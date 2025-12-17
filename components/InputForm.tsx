import React from 'react';
import { FormData } from '../types';
import { Search, Globe, AlignLeft, LinkIcon, PenTool } from './Icons';

interface InputFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Config Strategy
        </h2>
        <p className="text-sm text-slate-500 mt-1">Define your content parameters to start the analysis.</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Main Keyword */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Keyword</label>
          <div className="relative">
            <input
              type="text"
              name="keyword"
              value={formData.keyword}
              onChange={handleChange}
              placeholder="e.g. Best coffee machines 2024"
              className="w-full pl-4 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Globe className="w-4 h-4 text-slate-400" /> Language
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="English">English</option>
              <option value="Chinese (Simplified)">Chinese (Simplified)</option>
              <option value="Chinese (Traditional)">Chinese (Traditional)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>

          {/* Word Count */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <AlignLeft className="w-4 h-4 text-slate-400" /> Word Count
            </label>
            <select
              name="wordCount"
              value={formData.wordCount}
              onChange={(e) => setFormData(prev => ({...prev, wordCount: parseInt(e.target.value)}))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value={500}>Short (~500 words)</option>
              <option value={1000}>Standard (~1000 words)</option>
              <option value={1500}>Long-form (~1500 words)</option>
              <option value={2000}>Comprehensive (~2000+ words)</option>
            </select>
          </div>

          {/* Article Style */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <PenTool className="w-4 h-4 text-slate-400" /> Article Tone/Style (Optional)
            </label>
            <select
              name="articleStyle"
              value={formData.articleStyle}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="Comprehensive Guide">Comprehensive Guide (Objective & Detailed)</option>
              <option value="First Person (Personal Experience)">First Person (My Experience/Story)</option>
              <option value="Professional & Authoritative">Professional & Authoritative</option>
              <option value="Casual & Conversational">Casual & Conversational</option>
              <option value="Listicle / Step-by-Step">Listicle / Step-by-Step</option>
              <option value="Opinion / Editorial">Opinion / Editorial</option>
            </select>
          </div>
        </div>

        {/* Custom Context */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
            <LinkIcon className="w-4 h-4 text-slate-400" /> Reference Material (Optional)
          </label>
          <textarea
            name="customContext"
            value={formData.customContext}
            onChange={handleChange}
            rows={4}
            placeholder="Paste relevant URLs, text snippets, or specific requirements here..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">This context will be used to guide the AI's writing style and factual base.</p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onSubmit}
            disabled={isLoading || !formData.keyword.trim()}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all flex items-center justify-center gap-2
              ${isLoading || !formData.keyword.trim() 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-[0.99]'}`}
          >
            {isLoading ? 'Analyzing...' : 'Start Research & Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputForm;