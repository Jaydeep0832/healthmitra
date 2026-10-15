import React, { useState, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { Send, Mic, MicOff, Loader2, ShieldCheck } from 'lucide-react';

export default function MultilingualInput() {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { sendMessage, isLoading } = useChatStore();
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      sendMessage(text.trim());
      setText('');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  return (
    <div className="shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 sm:px-4 sm:py-3 z-10">
      <form onSubmit={handleSubmit} className="space-y-1.5">
        <div className="flex items-end space-x-2">
          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 transition-all ${
              isRecording
                ? 'bg-red-50 text-red-600 border border-red-300 animate-pulse shadow-sm shadow-red-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/80'
            }`}
            title={isRecording ? 'Stop Recording' : 'Voice Input (Speech-to-text)'}
            aria-label="Voice Input"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          {/* Main Input Textarea */}
          <div className="flex-1 relative">
            <textarea
              id="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your health questions or symptoms... (Press Enter to send)"
              className="w-full resize-none rounded-xl border border-slate-300 py-2.5 px-3.5 sm:px-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[46px] max-h-[110px] leading-relaxed transition"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Send Command Button */}
          <button
            type="submit"
            id="chat-send-btn"
            disabled={!text.trim() || isLoading}
            className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl flex-shrink-0 transition-all font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
              !text.trim() || isLoading
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm shadow-emerald-600/25 active:scale-95'
            }`}
            title="Send Message"
            aria-label="Send Message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>

        {/* Micro Disclaimer Bar */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
          <span>AI Clinical Assistant • In acute emergencies, immediately dial <strong>108</strong></span>
        </div>
      </form>
    </div>
  );
}

