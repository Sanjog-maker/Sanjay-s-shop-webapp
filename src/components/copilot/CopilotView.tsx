import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  Boxes,
  TrendingUp,
  Clock,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  CornerDownRight,
  RotateCcw
} from 'lucide-react';
import { CopilotMessage } from '../../types/index';
import { api } from '../../services/api';

interface CopilotViewProps {
  initialQuery?: string;
  onNavigate: (tab: string, param?: any) => void;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  initialQuery,
  onNavigate
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Namaste! I am your **ShopIQ Copilot** for **Balaji Stores** (ID: 48293, Chennai, TN).\n\nI analyze your live counter transactions, product margins, inventory turnover, and supplier lead times.\n\nTap any question below or ask me in English / Tamil:',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'What should I restock today?',
        'Which product sells the most?',
        'Which product gives me the highest profit?',
        'What are my low-stock products?',
        'How much did I sell today?',
        'Compare today\'s sales with yesterday.',
        'Which products are slow-moving?',
        'Which products may run out tomorrow?',
        'Show my best-selling category.'
      ]
    }
  ]);

  const quickQuestions = [
    'What should I restock today?',
    'Which product sells the most?',
    'Which product gives me the highest profit?',
    'What are my low-stock products?',
    'How much did I sell today?',
    'Compare today\'s sales with yesterday.',
    'Which products are slow-moving?',
    'Which products may run out tomorrow?',
    'Show my best-selling category.'
  ];

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Speech recognition setup for hands-free Copilot interaction
  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceTranscript('');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join(' ');
        setVoiceTranscript(transcript);
        setInputQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (voiceTranscript.trim()) {
          handleSendMessage(voiceTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;

    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: cleanQuery,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setVoiceTranscript('');
    setIsThinking(true);

    try {
      const response = await api.askCopilot(cleanQuery);
      const assistantMessage: CopilotMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        supportingData: response.supportingData,
        suggestedFollowUps: response.suggestedFollowUps
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Copilot query error:', error);
      const errorMessage: CopilotMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'I encountered an issue analyzing the store data. Please make sure your server is running or try asking again.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: ['How much sales today?', 'What is low on stock?']
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        role: 'assistant',
        content: 'Conversation reset. How can I assist you with your store operations today?',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'What should I order from ITC today?',
          'Which products gave me the most profit this week?',
          'Which items are expiring in 48h?'
        ]
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7rem)] bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Copilot Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">ShopIQ Retail Copilot</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full">
                Gemini 3.7 Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live Kirana store advisor connected to your inventory & billing engine
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="Reset conversation"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div className={`space-y-3 max-w-2xl ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line font-normal">{msg.content}</p>
                </div>

                {/* Supporting Data Card for Assistant */}
                {!isUser && msg.supportingData && (
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 space-y-2.5 text-xs text-left shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-emerald-900 border-b border-emerald-200/60 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        Verified Store Data Point
                      </span>
                      {msg.supportingData.confidence && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                          {msg.supportingData.confidence}% confidence
                        </span>
                      )}
                    </div>

                    {msg.supportingData.metricsBreakdown && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {msg.supportingData.metricsBreakdown.map((item, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-lg border border-emerald-100">
                            <span className="text-[10px] font-medium text-slate-500 block">{item.label}</span>
                            <span className="text-xs font-bold text-slate-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Follow-up Chips */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="space-y-1.5 pt-1 text-left">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3 text-slate-400" />
                      Suggested Follow-ups
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-tl-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Computing retail insights across catalog & bills...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggested Questions Bar */}
      <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-200 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try asking:</span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors whitespace-nowrap shadow-2xs shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            id="copilot-voice-btn"
            onClick={toggleVoiceRecording}
            className={`p-3 rounded-xl border transition-all ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Ask using voice'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            id="copilot-text-input"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening to your voice...'
                : 'Ask Copilot anything about sales, margins, or suppliers...'
            }
            className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />

          {/* Send Button */}
          <button
            type="submit"
            id="copilot-send-btn"
            disabled={!inputQuery.trim() || isThinking}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
