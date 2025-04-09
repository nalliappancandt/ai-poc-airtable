import React, { useState, useEffect, useRef } from 'react';
import { streamingFetch } from '../shared/client/streaming';

const RenderStreamData = () => {
  const [messages, setMessages] = useState<{ text?: string; content?: string; sender?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const getMessage = async (query: string) => {
    try {
      const request = new Request('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: query }),
      });

      const it = streamingFetch(request);
      let messageText = '';
      for await (const value of it) {
        const chunk = JSON.parse(value);
        setIsLoading(false);
        messageText += chunk.content;
        setMessages((prev) => {
          const updatedMessages = [...prev];
          if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].sender === 'bot') {
            updatedMessages[updatedMessages.length - 1] = { content: messageText, sender: 'bot' };
          } else {
            updatedMessages.push({ content: messageText, sender: 'bot' });
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.warn('Error fetching message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages((prevMessages) => [...prevMessages, { text: input, sender: 'user' }]);
      setInput('');
      setIsLoading(true);
      getMessage(input);
    }
  };

  return (
    <>
      <div className="bg-blue-500 text-white p-4 shadow-md text-center fixed top-0 left-0 w-full z-10">
        <h3 className="text-lg font-semibold">Airtable Chat Bot</h3>
        <p className="text-sm">Feel free to ask me anything. I'm here to help!</p>
      </div>
      <div className="flex flex-col h-screen max-w-md w-full mx-auto p-4 mt-24 bg-white shadow-lg rounded-lg border border-gray-200">
        {/* Header Card */}

        <div className="flex-1 overflow-y-auto space-y-4 px-2 py-4">
          {/* Conversation Display */}
          {messages.map((msg, index) => (
            <span
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <span
                className={`max-w-xs rounded-lg p-3 ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'inline-block p-3 rounded-2xl max-w-[80%] bg-gray-100 text-black'
                  }`}
              >
                {msg.text || msg.content}
              </span>
            </span>
          ))}
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Chat Box */}
        <div className="flex mt-4 pt-4 sticky bottom-0 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white p-3 rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default RenderStreamData;

