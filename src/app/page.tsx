'use client';

import { useState } from "react";

const Page = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const aiMessage = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="bg-white flex-1 p-4 mb-4 rounded-xl border-1 border-gray-500 overflow-y-auto min-h-[85vh] max-h-[85vh]" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
      {messages.map((message, index) => (
        <div
        key={index}
        className={`mb-4 ${
          message.role === "user" ? "text-right" : "text-left"
        }`}
        >
        <div
          className={`inline-block p-3 rounded-2xl max-w-[80%] ${
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800"
          }`}
        >
          {message?.content?.split('\n').map((line, index) => (
          <p key={index} className="mb-2">
            {line}
          </p>
          ))}
        </div>
        </div>
      ))}
      {isLoading && (
        <div className="text-left">
        <div className="inline-block p-3 rounded-2xl bg-gray-100 text-gray-400">
          Thinking...
        </div>
        </div>
      )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3 fixed bottom-0 left-0 w-full p-4 bg-white border-t-1 border-gray-500">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 p-3 rounded-xl border-1 border-gray-500"
        placeholder="Type your message..."
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
      >
        Send
      </button>
      </form>
    </div>
  );
};

export default Page;