import React, { useState } from 'react';
import InputForm from './components/InputForm';
import AnalysisView from './components/AnalysisView';
import ArticleView from './components/ArticleView';
import { AppState, FormData, AnalysisData } from './types';
import { analyzeKeyword, generateArticle } from './services/geminiService';
import { Loader2 } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [formData, setFormData] = useState<FormData>({
    keyword: '',
    language: 'English',
    wordCount: 1000,
    customContext: ''
  });
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [articleContent, setArticleContent] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalysisSubmit = async () => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    try {
      const data = await analyzeKeyword(formData);
      setAnalysisData(data);
      setAppState(AppState.REVIEW);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during analysis.");
      setAppState(AppState.IDLE);
    }
  };

  const handleGenerateArticle = async () => {
    if (!analysisData) return;
    setAppState(AppState.GENERATING);
    try {
      const content = await generateArticle(formData, analysisData);
      setArticleContent(content);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate article.");
      setAppState(AppState.REVIEW);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setAnalysisData(null);
    setArticleContent('');
    setErrorMsg(null);
    setFormData(prev => ({ ...prev, keyword: '', customContext: '' }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              SEO Master AI
            </h1>
          </div>
          <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded border border-green-200">
            Powered by Gemini
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <span className="font-bold">Error:</span> {errorMsg}
          </div>
        )}

        {/* State: IDLE or ANALYZING (Show Form) */}
        {(appState === AppState.IDLE || appState === AppState.ANALYZING) && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Create Top-Ranking Content</h2>
              <p className="text-slate-500">
                Analyze competition, extract keywords, and generate E-E-A-T optimized articles in seconds.
              </p>
            </div>
            <InputForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleAnalysisSubmit}
              isLoading={appState === AppState.ANALYZING}
            />
            {appState === AppState.ANALYZING && (
              <div className="mt-8 text-center text-slate-500 flex flex-col items-center gap-3 animate-pulse">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p>Scanning search results and analyzing keyword difficulty...</p>
              </div>
            )}
          </div>
        )}

        {/* State: REVIEW or GENERATING (Show Analysis Dashboard) */}
        {(appState === AppState.REVIEW || appState === AppState.GENERATING) && analysisData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-2xl font-bold text-slate-800">Strategy Report: <span className="text-blue-600">{formData.keyword}</span></h2>
               <button onClick={handleReset} className="text-sm text-slate-500 hover:text-slate-800 underline">Start Over</button>
            </div>
            <AnalysisView 
              data={analysisData} 
              onGenerate={handleGenerateArticle}
              isGenerating={appState === AppState.GENERATING}
            />
          </div>
        )}

        {/* State: COMPLETE (Show Final Article) */}
        {appState === AppState.COMPLETE && (
          <ArticleView content={articleContent} onReset={handleReset} />
        )}

      </main>
    </div>
  );
};

export default App;
