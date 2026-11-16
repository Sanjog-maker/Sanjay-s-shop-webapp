import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Boxes,
  Clock,
  CheckCircle2,
  Circle,
  Zap,
  DollarSign,
  PackageCheck,
  Percent,
  RefreshCw,
  MessageSquareQuote,
  ShieldAlert,
  ChevronRight,
  Info,
  Mic,
  MicOff,
  Send,
  X,
  Bot,
  Truck,
  Receipt,
  Calendar,
  Layers,
  HelpCircle,
  Check
} from 'lucide-react';
import { CommandCenterData, DashboardMetrics, Product, StockoutPrediction, TodayActionItem } from '../../types/index';
import { api } from '../../services/api';

interface CommandCenterViewProps {
  metrics: DashboardMetrics | null;
  products: Product[];
  onNavigate: (tab: string, subParam?: any) => void;
  onQuickRestock: (product?: Product) => void;
  onOpenCopilotWithQuery?: (query: string) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  metrics,
  products,
  onNavigate,
  onQuickRestock,
  onOpenCopilotWithQuery
}) => {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [predictions, setPredictions] = useState<StockoutPrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Ask ShopIQ Interactive Interface State
  const [queryInput, setQueryInput] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [copilotResponse, setCopilotResponse] = useState<{
    query: string;
    answer: string;
    supportingData?: any;
    suggestedFollowUps?: string[];
  } | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Today's Action Plan Checklist State (allows user to check/uncheck tasks)
  const [actionPlanTasks, setActionPlanTasks] = useState<TodayActionItem[]>([]);

  const fetchCommandCenterData = async () => {
    setIsLoading(true);
    try {
      const [cmdData, preds] = await Promise.all([
        api.getCommandCenter(),
        api.getStockoutPredictions()
      ]);
      setData(cmdData);
      setPredictions(preds);
      if (cmdData.todayActionPlan?.items) {
        setActionPlanTasks(cmdData.todayActionPlan.items);
      }
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandCenterData();
  }, []);

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQueryInput(transcript);
        handleAskShopIQ(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  const handleAskShopIQ = async (questionText?: string) => {
    const q = (questionText || queryInput).trim();
    if (!q) return;

    setIsAsking(true);
    try {
      const res = await api.askCopilot(q);
      setCopilotResponse({
        query: q,
        answer: res.answer,
        supportingData: res.supportingData,
        suggestedFollowUps: res.suggestedFollowUps
      });
      setQueryInput('');
    } catch (err) {
      console.error('Copilot request failed:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const toggleTaskCompleted = (taskId: string) => {
    setActionPlanTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = actionPlanTasks.filter((t) => t.completed).length;
  const progressPercent = actionPlanTasks.length > 0 ? Math.round((completedCount / actionPlanTasks.length) * 100) : 0;

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Analyzing store inventory, velocity & profit patterns...</p>
      </div>
    );
  }

  const greeting = data?.greeting || 'Good morning 👋';
  const headline = data?.summaryHeadline || "Here's what your store needs today.";
  const topCriticalPredictions = predictions.slice(0, 4);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP HERO & REAL-TIME STORE INTELLIGENCE BANNER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700 text-xs font-semibold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>ShopIQ Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {greeting}
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base font-normal max-w-xl">
              {headline}
            </p>
          </div>

          {/* Live Store Health KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-3 rounded-xl">
              <span className="block text-[11px] font-medium text-emerald-200 uppercase tracking-wider">Today&apos;s Revenue</span>
              <span className="text-xl font-bold text-white">₹{(metrics?.todayRevenue || 0).toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">{metrics?.todayBillsCount || 0} bills today</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-3 rounded-xl">
              <span className="block text-[11px] font-medium text-emerald-200 uppercase tracking-wider">Gross Margin</span>
              <span className="text-xl font-bold text-emerald-300">₹{(metrics?.todayProfit || 0).toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-200 block mt-0.5">
                {metrics?.todayRevenue && metrics.todayRevenue > 0
                  ? `${((metrics.todayProfit / metrics.todayRevenue) * 100).toFixed(1)}% margin`
                  : '18.5% avg'}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-3 rounded-xl col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-medium text-emerald-200 uppercase tracking-wider">Stockouts Watch</span>
              <span className={`text-xl font-bold ${data?.actionRequired.stockoutSoonCount ? 'text-amber-300' : 'text-emerald-300'}`}>
                {data?.actionRequired.stockoutSoonCount || 0} Items
              </span>
              <span className="text-[10px] text-emerald-200 block mt-0.5">
                {products.length} Active SKUs
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ASK SHOPIQ INTERACTIVE INTERFACE (Embedded in Command Center) */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-5 border-t border-emerald-800/80">
          <div className="bg-emerald-900/60 border border-emerald-700/60 rounded-xl p-3 sm:p-4 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200 mb-2">
              <Bot className="w-4 h-4 text-emerald-300" />
              <span>Ask ShopIQ Copilot (Voice & Text)</span>
            </div>

            {/* Input & Voice Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="ask-shopiq-input"
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskShopIQ();
                  }}
                  placeholder="Ask anything about inventory, sales, expiring dairy, margins or suppliers..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-emerald-950/80 border border-emerald-600/60 rounded-xl text-sm text-white placeholder-emerald-300/60 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
                {queryInput && (
                  <button
                    onClick={() => setQueryInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Voice Input Button */}
              <button
                id="ask-shopiq-mic-btn"
                onClick={toggleVoiceRecording}
                title={isListening ? 'Listening... click to stop' : 'Click to speak query'}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-emerald-800/80 text-emerald-200 border-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Submit Query Button */}
              <button
                id="ask-shopiq-submit-btn"
                onClick={() => handleAskShopIQ()}
                disabled={isAsking || !queryInput.trim()}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isAsking ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-950" />
                ) : (
                  <>
                    <span>Ask</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Prompt Suggestion Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-emerald-300/80 mr-1 font-medium">Suggestions:</span>
              {[
                "What should I reorder from suppliers today?",
                "Which dairy batches expire in 48h?",
                "What is my gross profit margin today?",
                "Show fastest selling products"
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskShopIQ(pill)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-200 border border-emerald-700/60 transition-colors"
                >
                  &ldquo;{pill}&rdquo;
                </button>
              ))}
            </div>

            {/* Inline AI Response Block */}
            {copilotResponse && (
              <div className="mt-4 pt-4 border-t border-emerald-700/60 bg-emerald-950/70 p-4 rounded-xl text-white space-y-3">
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Answer for: &ldquo;{copilotResponse.query}&rdquo;</span>
                  </div>
                  <button
                    onClick={() => setCopilotResponse(null)}
                    className="text-emerald-400 hover:text-white text-xs flex items-center gap-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-normal">
                  {copilotResponse.answer}
                </p>

                {/* Supporting Data Card */}
                {copilotResponse.supportingData && (
                  <div className="bg-emerald-900/80 border border-emerald-700/70 rounded-lg p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold text-emerald-200">
                      <span>Verified Store Metrics</span>
                      {copilotResponse.supportingData.confidence && (
                        <span className="px-2 py-0.5 rounded bg-emerald-800 text-[10px] text-emerald-200">
                          {copilotResponse.supportingData.confidence}% Confidence
                        </span>
                      )}
                    </div>

                    {copilotResponse.supportingData.metricsBreakdown && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {copilotResponse.supportingData.metricsBreakdown.map((item: any, i: number) => (
                          <div key={i} className="bg-emerald-950/60 p-2 rounded border border-emerald-800">
                            <span className="text-[10px] text-emerald-400 block">{item.label}</span>
                            <span className="font-semibold text-white text-xs">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Follow-up Question Chips */}
                {copilotResponse.suggestedFollowUps && copilotResponse.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-emerald-300 font-medium">Follow up:</span>
                    {copilotResponse.suggestedFollowUps.map((fu, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAskShopIQ(fu)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-md transition-colors"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION: TODAY'S ACTION PLAN (Interactive Dynamic Checklist) */}
      {/* ========================================================================= */}
      <section className="space-y-4" id="today-action-plan-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Today&apos;s Action Plan</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-md">
                  {completedCount} of {actionPlanTasks.length} Done ({progressPercent}%)
                </span>
              </div>
              <p className="text-xs text-slate-500">Prioritized operational steps based on live store data</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full sm:w-48 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Task Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actionPlanTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTaskCompleted(task.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                task.completed
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompleted(task.id);
                      }}
                      className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white hover:border-emerald-500'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <span className={`text-xs font-bold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    task.urgency === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : task.urgency === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {task.urgency}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-md">
                  ⚡ <strong>Expected Impact:</strong> {task.impact}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  {task.category}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (task.targetTab === 'reorder') {
                      onNavigate('reorder');
                    } else if (task.targetTab === 'expiry-watch') {
                      onNavigate('expiry-watch');
                    } else if (task.targetTab === 'profit-intel') {
                      onNavigate('profit-intel');
                    } else if (task.targetTab === 'sales') {
                      onNavigate('sales');
                    } else {
                      onNavigate(task.targetTab);
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>{task.actionText}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION: ACTION REQUIRED (Capital at Risk & Urgent Alerts) */}
      {/* ========================================================================= */}
      <section className="space-y-4" id="action-required-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Action Required</h2>
              <p className="text-xs text-slate-500">Urgent operational alerts requiring store owner decision</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
            {data?.actionRequired.criticalAlerts.length || 0} Active Decisions
          </span>
        </div>

        {/* Working Capital Exposure Banner */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Working Capital Exposure</span>
              <p className="text-xs text-amber-800 mt-0.5">
                ₹{(data?.actionRequired.revenueAtRisk || 0).toLocaleString('en-IN')} in inventory value is currently tied in short-expiry batches or pending stockout exposure.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reorder')}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors whitespace-nowrap"
          >
            Review Reorder Plan
          </button>
        </div>

        {/* Critical Alerts Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.actionRequired.criticalAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-shadow shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    alert.category === 'EXPIRY'
                      ? 'bg-rose-100 text-rose-800'
                      : alert.category === 'INVENTORY'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {alert.category}
                  </span>
                  <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Urgent
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (alert.category === 'EXPIRY') onNavigate('expiry-watch');
                    else if (alert.category === 'INVENTORY') onNavigate('reorder');
                    else onNavigate('profit-intel');
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Take action</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION: PREDICTIVE INVENTORY CARDS */}
      {/* ========================================================================= */}
      <section className="space-y-4" id="predictive-inventory-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Truck className="w-4.5 h-4.5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Predictive Inventory & Run-Rate</h2>
              <p className="text-xs text-slate-500">Predicted stockout dates and economic reorder quantities</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reorder')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Smart Reorder PO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {topCriticalPredictions.map((pred) => {
            const matchedProduct = products.find((p) => p.id === pred.productId);
            const isUrgent = pred.urgency === 'CRITICAL' || pred.urgency === 'HIGH';

            return (
              <div
                key={pred.productId}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {pred.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      pred.urgency === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : pred.urgency === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {pred.urgency}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{pred.productName}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Supplier: {pred.brand || 'Distributor'}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Stock:</span>
                      <strong className={pred.currentStock <= 3 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                        {pred.currentStock} {pred.unit}s
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Daily Velocity:</span>
                      <span className="font-semibold text-slate-700">~{pred.averageDailySales} {pred.unit}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Stockout By:</span>
                      <strong className="text-rose-700">{pred.predictedStockoutDate}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500">
                    Confidence: <strong className="text-emerald-700 font-bold">{pred.confidenceScore}%</strong>
                  </div>
                  <button
                    onClick={() => onQuickRestock(matchedProduct)}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    Reorder {pred.recommendedReorderQty}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION: EXPLAINABLE AI RECOMMENDATIONS (What, Why, Action) */}
      {/* ========================================================================= */}
      <section className="space-y-4" id="ai-recommendations-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Explainable AI Recommendations</h2>
              <p className="text-xs text-slate-500">Transparent reasoning structured into &quot;What / Why / Action&quot; rationale</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reorder')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View all items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {data?.aiRecommendations.map((rec) => {
            const isExpanded = activeAccordion === rec.id;
            const targetProd = products.find((p) => p.name === rec.productName);

            return (
              <div
                key={rec.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-emerald-200 transition-colors"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setActiveAccordion(isExpanded ? null : rec.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 select-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{rec.productName}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-md">
                          {rec.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Current stock: <strong className="text-slate-800">{rec.currentStock} units</strong> • Velocity: ~{rec.avgDailySales} units/day • Stockout expected: <strong className="text-rose-600">{rec.predictedStockout}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickRestock(targetProd);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                    >
                      Reorder {rec.recommendedReorder} units
                    </button>
                  </div>
                </div>

                {/* Structured Rationale (What / Why / Action) */}
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      1. What is happening?
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{rec.what}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      2. Why is it happening?
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{rec.why}</p>
                  </div>

                  <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200/80">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                      3. Recommended Action
                    </span>
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium">{rec.action}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION: PROFIT OPPORTUNITIES & MARGIN BOOST */}
      {/* ========================================================================= */}
      <section className="space-y-4" id="profit-opportunities-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Profit Opportunities</h2>
              <p className="text-xs text-slate-500">Tactical cross-selling, pricing tweaks and trade discount slabs</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('profit-intel')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Margin Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.profitOpportunities.map((prof) => (
            <div
              key={prof.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    {prof.potentialGain}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">Kirana Basket Intel</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{prof.title}</h3>
                <p className="text-xs font-semibold text-slate-800">{prof.highlight}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{prof.explanation}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('billing')}
                  className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
                >
                  <span>Apply combo in billing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION: BUSINESS ALERTS & ANOMALIES */}
      {/* ========================================================================= */}
      <section className="space-y-4" id="business-alerts-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Business Alerts</h2>
              <p className="text-xs text-slate-500">Unusual velocity deviations, low margin warnings and overstock checks</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Full Store Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.businessAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    alert.type === 'SPIKE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : alert.type === 'LOW_MARGIN'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {alert.type.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                <p className="text-xs text-slate-700 font-medium">{alert.message}</p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Impact: </strong>{alert.impact}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 italic">{alert.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

