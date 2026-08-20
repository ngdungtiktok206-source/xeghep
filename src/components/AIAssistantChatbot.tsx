import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight, CornerDownLeft } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AIAssistantChatbotProps {
  onApplySearchPreset?: (originId: string, destId: string) => void;
}

export const AIAssistantChatbot: React.FC<AIAssistantChatbotProps> = ({ onApplySearchPreset }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý Điều phối Lộ tuyến Thông minh của viastep. Bạn muốn tìm chuyến xe ghép liên tỉnh hay cần giải đáp về hành lang tuyến, điểm đón trả?',
      timestamp: '08:00',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Hệ thống đã nhận thông tin và sẵn sàng hỗ trợ bạn tìm chuyến phù hợp!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'Hiện có nhiều xe Innova và Limousine đang chạy dọc cao tốc Pháp Vân - Ninh Bình. Bạn có thể chọn chuyến phù hợp trực tiếp trên danh sách kết quả!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full shadow-xl shadow-indigo-300 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-2"
          title="Trợ lý Lộ tuyến AI"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold pr-1">Hỏi AI Lộ tuyến</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-32px)] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold">Trợ lý AI viastep</h3>
                <p className="text-[10px] text-indigo-200">Hỗ trợ ghép xe theo hành lang lộ tuyến</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-1.5 text-[11px]">
            <button
              onClick={() => handleSend('Hà Nội đi Ninh Bình sáng mai có xe nào còn 2 chỗ?')}
              className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Hà Nội → Ninh Bình (2 chỗ)?
            </button>
            <button
              onClick={() => handleSend('Tôi ở Phủ Lý muốn đi ghép về Tràng An lúc 9h')}
              className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Phủ Lý → Tràng An lúc 9h?
            </button>
            <button
              onClick={() => handleSend('Giá vé ghép xe tính thế nào so với taxi riêng?')}
              className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Giá vé ghép vs Taxi riêng?
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    m.sender === 'user' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs whitespace-pre-line'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 italic p-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Trợ lý AI đang phân tích dữ liệu lộ tuyến...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi lộ trình..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
