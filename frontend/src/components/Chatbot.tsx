import { useState, useRef, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';

interface Message {
  text: string;
  isUser: boolean;
  products?: any[];
}

interface ChatbotProps {
  onOpenCheckout?: () => void;
}

const Chatbot = ({ onOpenCheckout }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Xin chào! Tôi là Nero AI. Tôi có thể giúp bạn chọn món không?', isUser: false }
  ]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => (prev ? prev + ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if(!recognitionRef.current) {
        alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");
        return;
      }
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setLoading(true);

    try {
      // Gọi AI đa năng để xử lý cả đặt món và tư vấn
      const response = await axiosClient.post('/ai/parse-order', { text: userMessage }) as any;
      
      if (response) {
        // 1. Hiển thị lời thoại từ AI
        setMessages(prev => [...prev, { 
          text: response.reply, 
          isUser: false,
          products: response.recommendations // Sản phẩm gợi ý
        }]);

        // 2. Nếu có món ăn được trích xuất (đặt món), tự động thêm vào giỏ
        if (response.items && response.items.length > 0) {
          response.items.forEach((item: any) => {
            addToCart({
              product_id: item.product_id,
              name: item.name,
              price: item.price,
              image_url: item.image_url,
              quantity: item.quantity
            });
          });

          // Nếu khách gọi món, tự động mở modal thanh toán sau 2s để trải nghiệm mượt mà
          if (onOpenCheckout) {
            setTimeout(onOpenCheckout, 2000);
          }
        }
      }
    } catch (error) {
      console.error('AI error:', error);
      setMessages(prev => [...prev, { text: 'Nero AI đang bận một chút, bạn thử lại sau nhé!', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Trigger Button */}
      <button 
        className={`chatbot-trigger glass ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window glass animate-fade-in">
          <div className="chatbot-header">
            <h3>Nero AI Assistant</h3>
            <span>Online</span>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message-container ${msg.isUser ? 'user' : 'bot'}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
                {msg.products && msg.products.length > 0 && (
                  <div className="bot-recommendations">
                    {msg.products.map((p: any) => (
                      <div key={p.id} className="rec-card glass">
                        <img src={p.image_url} alt={p.name} />
                        <div className="rec-info">
                          <span>{p.name}</span>
                          <button onClick={() => {
                            addToCart({
                              product_id: p.id,
                              name: p.name,
                              price: p.price,
                              image_url: p.image_url,
                              quantity: 1
                            });
                            alert(`Đã thêm ${p.name} vào giỏ hàng!`);
                          }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="message-container bot"><div className="message-bubble dot-flashing">...</div></div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <button 
              type="button" 
              onClick={toggleListening}
              style={{
                position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                background: isListening ? '#10b981' : 'transparent',
                border: 'none', color: isListening ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', borderRadius: '50%', width: '30px', height: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
              title={isListening ? 'Đang nghe...' : 'Ra lệnh bằng giọng nói'}
            >
              🎙️
            </button>
            <input 
              type="text" 
              placeholder={isListening ? "Đang nghe..." : "Hỏi Nero AI (ví dụ: cho 2 bạc xỉu)..."} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ paddingLeft: '45px' }}
              disabled={isListening}
            />
            <button type="submit" disabled={isListening}>➤</button>
          </form>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { transform: translateY(-50%) scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: translateY(-50%) scale(1.1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: translateY(-50%) scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
