import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';

export default function ChatHistory() {
  const { messages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="mb-2">Hello! I am HealthMitra.</p>
          <p className="text-sm">How can I help you today?</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => (
        <div key={index} className="space-y-4">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%] shadow-sm">
              <p>{msg.user_message}</p>
            </div>
          </div>
          
          {/* AI Response */}
          <div className="flex justify-start">
            <div className={`rounded-2xl rounded-tl-none px-4 py-3 max-w-[90%] shadow-sm ${msg.should_escalate ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-100'}`}>
              <div className="prose prose-sm max-w-none text-gray-800">
                <p>{msg.ai_response}</p>
                {msg.should_escalate && (
                  <div className="mt-2 text-sm text-red-600 font-bold border-t border-red-200 pt-2">
                    ⚠️ Immediate medical attention is recommended.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
