import React, { useState } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaExpand, FaCompress } from 'react-icons/fa';

interface ChatButtonProps {
  className?: string;
  isModalOpen?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ className, isModalOpen = false }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot', timestamp: Date}>>([
    {
      id: 1,
      text: "Hello! I'm your dashboard assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'user' as const,
        timestamp: new Date()
      };
      
      setMessages([...messages, newMessage]);
      const userMessage = message;
      setMessage('');
      
      // Create initial bot message
      const botMessageId = messages.length + 2;
      const initialBotMessage = {
        id: botMessageId,
        text: "",
        sender: 'bot' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, initialBotMessage]);
      
      try {
        const response = await fetch('https://api.tandemn.com/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_TANDEM_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'Qwen/Qwen3-32B-AWQ',
            messages: [
              { role: 'system', content: 'You are a helpful dashboard assistant. You can only answer questions related to the system dashboard.\n\nThe dashboard includes:\n- General cluster statistics.\n- Individual device statistics (%CPU, %GPU, %RAM, temperature).\n- A job table showing tasks assigned to devices for execution.\n\nIf the user asks anything unrelated to the dashboard, you must respond only with:\n"I can only answer questions about the dashboard."\n\nAlways keep your answers clear, concise, and professional. Ask the questions in the language that the user formulate the question in.' },
              { role: 'user', content: userMessage }
            ],
            stream: true
          })
        });
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        const filterThinkTags = (text: string) => {
          return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        };

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    const filteredResponse = filterThinkTags(fullResponse);
                    // Update the bot message with streaming text in real-time
                    setMessages(prev => prev.map(msg => 
                      msg.id === botMessageId 
                        ? { ...msg, text: filteredResponse }
                        : msg
                    ));
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                  console.warn('Failed to parse streaming data:', data);
                }
              }
            }
          }
        }

      } catch (error) {
        console.error('Failed to get AI response:', error);
        // Update with error message
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: "Sorry, I'm having trouble connecting right now. Please try again later." }
            : msg
        ));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <>
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={className}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgba(40, 40, 40, 0.9)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'all 0.3s ease',
          transform: isAnimating ? 'scale(0.9) rotate(15deg)' : 'scale(1) rotate(0deg)',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = 'rgba(60, 60, 60, 0.95)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <FaComments />
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div style={{
          position: 'fixed',
          bottom: isExpanded ? '20px' : '90px',
          right: '20px',
          width: isExpanded ? '600px' : '380px',
          height: isExpanded ? '700px' : '500px',
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Dark Overlay when modal is open */}
          {isModalOpen && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1,
              borderRadius: '12px'
            }} />
          )}
          {/* Chat Header */}
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(30, 30, 30, 0.8)',
            color: '#F9FAFB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              Dashboard Assistant
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px'
                }}
              >
                {isExpanded ? <FaCompress /> : <FaExpand />}
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'rgba(20, 20, 20, 0.95)'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: msg.sender === 'user' ? '#3B82F6' : 'rgba(40, 40, 40, 0.8)',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#F9FAFB',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  boxShadow: msg.sender === 'user' 
                    ? '0 2px 8px rgba(59, 130, 246, 0.2)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.3)',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {msg.text}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6B7280',
                  marginTop: '6px',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '12px',
            backgroundColor: 'rgba(30, 30, 30, 0.8)'
          }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your dashboard..."
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                color: '#F9FAFB',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3B82F6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              style={{
                padding: '12px 16px',
                backgroundColor: message.trim() ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: message.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                boxShadow: message.trim() ? '0 2px 8px rgba(59, 130, 246, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (message.trim()) {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                }
              }}
              onMouseLeave={(e) => {
                if (message.trim()) {
                  e.currentTarget.style.backgroundColor = '#3B82F6';
                }
              }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;
