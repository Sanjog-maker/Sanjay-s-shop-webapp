import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  Truck,
  Clock,
  Zap,
  Tag,
  Boxes
} from 'lucide-react';
import { TodayActionPlan, TodayActionItem, ActionPriority } from '../../types/index';

interface TodaysActionPlanCardProps {
  plan: TodayActionPlan | null;
  onNavigate: (tab: string, param?: any) => void;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export const TodaysActionPlanCard: React.FC<TodaysActionPlanCardProps> = ({
  plan,
  onNavigate,
  onTaskToggle
}) => {
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  if (!plan) {
    return null;
  }

  const handleToggle = (item: TodayActionItem) => {
    const nextState = new Set(completedTaskIds);
    const isNowCompleted = !nextState.has(item.id);
    if (isNowCompleted) {
      nextState.add(item.id);
    } else {
      nextState.delete(item.id);
    }
    setCompletedTaskIds(nextState);
    if (onTaskToggle) {
      onTaskToggle(item.id, isNowCompleted);
    }
  };

  const highPriorityItems = plan.highPriority || [];
  const attentionItems = plan.attention || [];
  const opportunityItems = plan.opportunity || [];

  const totalCount = highPriorityItems.length + attentionItems.length + opportunityItems.length;
  const completedCount = completedTaskIds.size;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const renderSectionHeader = (
    emoji: string,
    title: string,
    priority: ActionPriority,
    count: number,
    colorClasses: { bg: string; text: string; border: string }
  ) => (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${colorClasses.bg} ${colorClasses.border} border`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{emoji}</span>
        <span className={`text-xs font-bold uppercase tracking-wider ${colorClasses.text}`}>
          {title}
        </span>
      </div>
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/80 ${colorClasses.text}`}>
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  );

  const renderItemCard = (item: TodayActionItem, priority: ActionPriority) => {
    const isCompleted = completedTaskIds.has(item.id);

    return (
      <div
        key={item.id}
        className={`p-3.5 rounded-xl border transition-all ${
          isCompleted
            ? 'bg-slate-50/80 border-slate-200 opacity-60'
            : priority === 'HIGH'
            ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
            : priority === 'ATTENTION'
            ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
            : 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            {/* Task completion toggle */}
            <button
              onClick={() => handleToggle(item)}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
              className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              )}
            </button>

            {/* Task details */}
            <div className="space-y-1 min-w-0">
              <p
                className={`text-xs font-bold tracking-tight ${
                  isCompleted
                    ? 'line-through text-slate-400'
                    : 'text-slate-900'
                }`}
              >
                {item.title}
              </p>

              {/* Explainable WHY statement (Data-driven explanation) */}
              <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                <strong className="font-semibold text-slate-700">Why: </strong>
                {item.why}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          {item.actionText && (
            <button
              onClick={() => onNavigate(item.targetTab || 'command-center', item.productId)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shadow-2xs ${
                priority === 'HIGH'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : priority === 'ATTENTION'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>{item.actionText}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                TODAY&apos;S ACTION PLAN
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full">
                AI Store Operator
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Operational priorities computed from live inventory turnover, velocity, and supplier lead times
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800">
              {completedCount} of {totalCount} Done
            </span>
            <span className="block text-[10px] text-slate-400">
              {progressPercent}% completed
            </span>
          </div>
          <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Structured Tiers: High Priority, Attention, Opportunity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 🔴 HIGH PRIORITY */}
        <div className="space-y-3">
          {renderSectionHeader(
            '🔴',
            'HIGH PRIORITY',
            'HIGH',
            highPriorityItems.length,
            { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200' }
          )}
          <div className="space-y-2.5">
            {highPriorityItems.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400">
                No critical stockout risks today.
              </div>
            ) : (
              highPriorityItems.map((item) => renderItemCard(item, 'HIGH'))
            )}
          </div>
        </div>

        {/* 🟡 ATTENTION */}
        <div className="space-y-3">
          {renderSectionHeader(
            '🟡',
            'ATTENTION',
            'ATTENTION',
            attentionItems.length,
            { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' }
          )}
          <div className="space-y-2.5">
            {attentionItems.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400">
                No immediate expiry or dead stock risks.
              </div>
            ) : (
              attentionItems.map((item) => renderItemCard(item, 'ATTENTION'))
            )}
          </div>
        </div>

        {/* 🟢 OPPORTUNITY */}
        <div className="space-y-3">
          {renderSectionHeader(
            '🟢',
            'OPPORTUNITY',
            'OPPORTUNITY',
            opportunityItems.length,
            { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200' }
          )}
          <div className="space-y-2.5">
            {opportunityItems.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400">
                Analyzing recent counter sales for combo opportunities.
              </div>
            ) : (
              opportunityItems.map((item) => renderItemCard(item, 'OPPORTUNITY'))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
