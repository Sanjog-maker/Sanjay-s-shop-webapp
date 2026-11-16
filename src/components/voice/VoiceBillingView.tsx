import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, VoiceParseResponse } from '../../types/index';
import { api } from '../../services/api';
import {
  Mic,
  MicOff,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Languages
} from 'lucide-react';

interface VoiceBillingViewProps {
  products: Product[];
  onOpenBillingWithCart: (items: CartItem[]) => void;
}

const SAMPLE_PROMPTS = [
  {
    lang: 'English',
    text: '2 Aashirvaad atta, 3 biscuits and 1 milk packet',
    hint: 'ITC Atta + Good Day + Arokya Milk'
  },
  {
    lang: 'English',
    text: '1kg Tata dal, 2 packs Surf Excel and 1 Red Label tea',
    hint: 'Grains + Detergent + Tea'
  },
  {
    lang: 'Tamil',
    text: 'இரண்டு ஆரோக்கியா பால், ஒரு பாக்கெட் பொன்னி அரிசி மற்றும் 3 விம் பார்',
    hint: '2 Milk + 1 Ponni Rice + 3 Vim Bar'
  },
  {
    lang: 'Tamil',
    text: '5 மேகி நூடுல்ஸ், 2 குட் டே பிஸ்கட் மற்றும் 1 டெட்டால் சோப்',
    hint: '5 Maggi + 2 Biscuits + 1 Dettol'
  }
];

export const VoiceBillingView: React.FC<VoiceBillingViewProps> = ({
  products,
  onOpenBillingWithCart
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'ta-IN' | 'hi-IN'>('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<VoiceParseResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setManualInput(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions or use the text box below.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition error: ${event.error}. You can also type or use sample voice queries.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setParseResult(null);
      setErrorMessage('');
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = selectedLanguage;
          recognitionRef.current.start();
        } else {
          setErrorMessage('Web Speech API is not supported in this browser. Please type the spoken items below.');
        }
      } catch (err: any) {
        console.error('Could not start recognition:', err);
        setErrorMessage('Could not initialize microphone. Please type your voice order below.');
      }
    }
  };

  const handleParseTranscript = async (queryText: string) => {
    const textToParse = queryText.trim();
    if (!textToParse) {
      setErrorMessage('Please speak or enter some grocery items to parse');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await api.parseVoiceBill(textToParse, selectedLanguage);
      setParseResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing voice items with Gemini AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferToBilling = () => {
    if (!parseResult || parseResult.parsedItems.length === 0) return;

    const cartItems: CartItem[] = [];

    for (const item of parseResult.parsedItems) {
      // Find full product object from catalog
      const product = products.find((p) => p.id === item.matchedProductId) || item.matchedProduct;
      if (product) {
        cartItems.push({
          productId: product.id,
          product,
          quantity: item.quantity || 1,
          unitPrice: product.sellingPrice,
          discount: 0,
          total: (item.quantity || 1) * product.sellingPrice
        });
      }
    }

    if (cartItems.length > 0) {
      onOpenBillingWithCart(cartItems);
    } else {
      setErrorMessage('Could not match any products in catalog to transfer to cart');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
              AI Voice Engine
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Zero-Touch Voice Billing (Tamil &amp; English)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Speak natural multi-item grocery orders without touching barcode scanners. Powered by Gemini 3.7 Flash.
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
          <Languages className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <button
            onClick={() => setSelectedLanguage('en-IN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedLanguage === 'en-IN'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English (IN)
          </button>
          <button
            onClick={() => setSelectedLanguage('ta-IN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedLanguage === 'ta-IN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            தமிழ் (Tamil)
          </button>
          <button
            onClick={() => setSelectedLanguage('hi-IN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedLanguage === 'hi-IN'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            हिंदी (Hindi)
          </button>
        </div>
      </div>

      {/* Voice Recording Microphone Hero */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
        {/* Animated Background Pulse when listening */}
        {isListening && (
          <div className="absolute inset-0 bg-emerald-50/50 animate-pulse pointer-events-none" />
        )}

        {/* Main Microphone Button */}
        <button
          id="voice-record-btn"
          onClick={toggleListening}
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative z-10 shadow-lg ${
            isListening
              ? 'bg-rose-600 text-white ring-8 ring-rose-100 scale-105'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-8 ring-emerald-50 hover:scale-102'
          }`}
        >
          {isListening ? (
            <MicOff className="w-9 h-9 animate-bounce" />
          ) : (
            <Mic className="w-9 h-9" />
          )}
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
            {isListening ? 'Stop' : 'Tap & Speak'}
          </span>
        </button>

        {/* Status prompt text */}
        <div className="mt-4 z-10">
          <p className="text-sm font-bold text-slate-800">
            {isListening
              ? 'Listening... Speak items with quantities naturally'
              : 'Tap the mic and speak in Tamil, Tanglish, or English'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Example: &quot;2 Aashirvaad atta, 3 biscuits and 1 milk packet&quot; or &quot;2 பாக்கெட் ஆரோக்கியா பால்&quot;
          </p>
        </div>

        {/* Live / Manual Input Area */}
        <div className="w-full max-w-xl mt-6 space-y-2 z-10">
          <div className="relative">
            <textarea
              id="voice-transcript-input"
              rows={3}
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Spoken words will stream here automatically, or you can type here directly..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all resize-none font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            {manualInput && (
              <button
                onClick={() => {
                  setManualInput('');
                  setTranscript('');
                  setParseResult(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Clear
              </button>
            )}
            <button
              id="parse-voice-btn"
              onClick={() => handleParseTranscript(manualInput)}
              disabled={isLoading || !manualInput.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                isLoading || !manualInput.trim()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemini AI Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Parse Spoken Order</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Test Prompts Chips */}
        <div className="w-full max-w-xl mt-4 pt-4 border-t border-slate-100 z-10 text-left">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-2">
            <Volume2 className="w-3 h-3" />
            Or try instant sample queries:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setManualInput(sample.text);
                  handleParseTranscript(sample.text);
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-emerald-700">
                  <span>{sample.lang}</span>
                  <span>{sample.hint}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                  &quot;{sample.text}&quot;
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Structured AI Parse Results Card */}
      {parseResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-sm text-slate-900">
                  AI Parsed Cart ({parseResult.parsedItems.length} items matched)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Matched against active inventory catalog with prices &amp; available stock
              </p>
            </div>

            <button
              id="transfer-to-pos-btn"
              onClick={handleTransferToBilling}
              disabled={parseResult.parsedItems.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md self-start sm:self-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Create Bill with these Items</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Matched Items Table */}
          <div className="divide-y divide-slate-100">
            {parseResult.parsedItems.map((item, idx) => {
              const matchedProduct =
                products.find((p) => p.id === item.matchedProductId) || item.matchedProduct;
              const unitPrice = matchedProduct ? matchedProduct.sellingPrice : 0;
              const itemTotal = unitPrice * item.quantity;

              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">
                          {matchedProduct ? matchedProduct.name : item.productName}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          {Math.round((item.confidence || 0.9) * 100)}% match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Spoken as: &quot;{item.rawText}&quot; {matchedProduct?.regionalName ? `• ${matchedProduct.regionalName}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900">
                      {item.quantity} {item.unit || matchedProduct?.unit || 'units'}
                    </div>
                    {matchedProduct && (
                      <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                        ₹{itemTotal} (₹{unitPrice} each)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unrecognized Phrases Alert */}
          {parseResult.unrecognizedPhrases && parseResult.unrecognizedPhrases.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Unrecognized phrases in speech:
              </span>
              <p className="text-[11px] text-amber-700">
                {parseResult.unrecognizedPhrases.join(', ')} - You can add these manually in POS billing or add them to the product catalog.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
