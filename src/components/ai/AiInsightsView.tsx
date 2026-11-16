import React, { useState, useEffect } from 'react';
import { AIInsightReport, Product } from '../../types/index';
import { api } from '../../services/api';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Send,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  Bot,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AiInsightsViewProps {
  products: Product[];
  onNavigateToRestock: (product?: Product) => void;
}

const SAMPLE_QUESTIONS = [
  'Which items should I reorder urgently before the weekend rush?',
  'What are my highest margin products and how can I boost their sales?',
  'Which slow-moving products have capital locked up?',
  'Suggest 2 promotional bundles/combos for grocery buyers.'
];

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({
  products,
  onNavigateToRestock
}) => {
  const [report, setReport] = useState<AIInsightReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // AI Chat Assistant state
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'Namaste! I am your ShopIQ Kirana AI Assistant. Ask me anything about your inventory, sales velocity, supplier orders, or product pricing strategy.',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const fetchAIInsights = async () => {
    setIsGenerating(true);
    setErrorMessage('');
    try {
      const data = await api.getAIInsights();
      setReport(data);
    } catch (err: any) {
      console.error('AI Insights error:', err);
      setErrorMessage(err.message || 'Failed to generate AI insights. Please verify Gemini API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const handleAskQuestion = async (qText?: string) => {
    const textToSend = qText || question;
    if (!textToSend.trim() || isAsking) return;

    const userMessage = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsAsking(true);

    try {
      const res = await api.askAI(textToSend);
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Apologies, I encountered an issue: ${err.message || 'Unable to connect to assistant'}. Please retry.`,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Store Advisor & Predictive Intelligence
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 rounded-md">
              Gemini 2.5
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated stockout forecasting, dead-stock clearance strategies & conversational retail advisor
          </p>
        </div>

        <button
          id="regenerate-ai-insights-btn"
          onClick={fetchAIInsights}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs self-start sm:self-auto"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Analyzing Store...' : 'Refresh AI Audit'}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice regarding AI analysis</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* AI Intelligence Dashboard */}
      {isGenerating && !report ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-sm font-semibold text-slate-800">
            Gemini is analyzing your sales history & stock thresholds...
          </p>
          <p className="text-xs text-slate-400">
            Detecting purchasing trends, demand fluctuations, and margin optimizations.
          </p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">
                  AI Executive Store Summary
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                Generated {new Date(report.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {report.summary}
            </p>
          </div>

          {/* Grid: Stockout Predictions & Slow Mover Strategies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stockout Risk Warnings */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    {report.stockoutPredictions.title}
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Predictive Depletion</span>
              </div>

              <div className="divide-y divide-slate-100">
                {report.stockoutPredictions.items.map((item, idx) => {
                  const matchingProduct = products.find((p) =>
                    p.name.toLowerCase().includes(item.productName.toLowerCase())
                  );
                  return (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">
                            {item.productName}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                              item.urgency === 'HIGH'
                                ? 'bg-rose-100 text-rose-800'
                                : item.urgency === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.urgency} RISK
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.currentStock} units left • Estimated depletion in{' '}
                          <span className="font-semibold text-amber-800">{item.estimatedDaysLeft} days</span>
                        </p>
                      </div>

                      <button
                        onClick={() => onNavigateToRestock(matchingProduct)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <span>Restock +{item.suggestedReorderQty}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slow Moving Capital Lock Clearance */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    {report.slowMovingRisk.title}
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Dead Stock Plan</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Actionable Recommendation</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {report.slowMovingRisk.actionableAdvice}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">Flagged Slow Inventory:</p>
                <div className="flex flex-wrap gap-1.5">
                  {report.slowMovingRisk.items.map((it, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg border border-slate-200"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Business Recommendations & Market Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Recommendations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Strategic Growth Actions for Kirana
                </h2>
              </div>
              <ul className="space-y-2">
                {report.businessRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Seller Momentum */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {report.topSellersInsight.title}
                </h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {report.topSellersInsight.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {report.topSellersInsight.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200"
                  >
                    ⭐ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Interactive AI Retail Chatbot */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Ask ShopIQ Kirana Assistant
              </h2>
              <p className="text-[11px] text-slate-400">
                Context-aware AI for supplier negotiations, pricing, and Tamil/English retail queries
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(sq)}
              className="text-left px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              💬 {sq}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div className="h-64 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {isAsking && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
                <span>Kirana assistant is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question about sales, inventory, or margins (e.g., 'What are my top 3 items?')..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={!question.trim() || isAsking}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
