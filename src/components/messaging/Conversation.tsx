import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Message } from '../../types';
import Button from '../ui/Button';
import { Send } from 'lucide-react';

interface ConversationProps {
  messages: Message[];
  conversationId: string;
  onSendMessage: (content: string) => void;
}

const Conversation: React.FC<ConversationProps> = ({ messages, conversationId, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // Create a temporary message object for immediate display
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    // Clear input immediately
    setNewMessage('');

    // Add message to UI immediately
    messages.push(tempMessage);

    // Send message to server
    await onSendMessage(tempMessage.content);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach((message) => {
    const date = message.created_at.split('T')[0];
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
        {Object.keys(groupedMessages).map((date) => (
          <div key={date}>
            <div className="text-center my-4">
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                {formatMessageDate(date)}
              </span>
            </div>
            {groupedMessages[date].map((message) => {
              const isCurrentUser = message.sender_id === user?.id;
              
              return (
                <div 
                  key={message.id}
                  className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-medium mr-2 self-end">
                      {message.sender?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div 
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isCurrentUser 
                        ? 'bg-orange-500 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {!isCurrentUser && (
                      <div className="text-xs font-medium mb-1">
                        {message.sender?.name || 'Unknown User'}
                      </div>
                    )}
                    <p className="break-words">{message.content}</p>
                    <div className={`text-xs mt-1 ${isCurrentUser ? 'text-orange-100' : 'text-gray-500'}`}>
                      {formatMessageTime(message.created_at)}
                    </div>
                  </div>
                  {isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-medium ml-2 self-end">
                      {message.sender?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim()}
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Conversation;