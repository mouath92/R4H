import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader } from 'lucide-react';
import Button from '../ui/Button';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { initializeChat, sendMessage, getMessages } from '../../lib/chat';

interface ChatDialogProps {
  host: User | null;
  spaceId?: string;
  onClose: () => void;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ host, spaceId, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const setupChat = async () => {
      if (!user?.id || !host?.id) {
        setError('Unable to initialize chat. Please try again later.');
        setInitializing(false);
        return;
      }

      try {
        // Initialize chat and get conversation ID
        const chatId = await initializeChat(user.id, host.id, spaceId);
        setConversationId(chatId);
        setError(null);

        // Load existing messages
        const existingMessages = await getMessages(chatId);
        setMessages(existingMessages ?? []);

        // Set up real-time subscription
        const channel = supabase
          .channel(`messages-${chatId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${chatId}`
          }, async (payload) => {
            const { data: sender } = await supabase
              .from('users')
              .select('id, name, email, role')
              .eq('id', payload.new.sender_id)
              .single();

            // Only add the message if it's not already in the list
            setMessages(current => {
              const messageExists = current.some(msg => msg.id === payload.new.id);
              if (messageExists) {
                return current;
              }
              return [...current, { ...payload.new, sender }];
            });
          })
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up chat:', error);
        setError('Failed to initialize chat');
      } finally {
        setInitializing(false);
      }
    };

    setupChat();
  }, [user?.id, host?.id, spaceId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user?.id || !conversationId) return;

    try {
      setSending(true);
      setError(null);

      // Create temporary message for immediate display
      const tempMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content: message.trim(),
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };

      // Add message to UI immediately
      setMessages(prev => [...prev, tempMessage]);
      
      // Clear input
      setMessage('');

      // Send to server
      await sendMessage(conversationId, user.id, message.trim());
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      
      // Remove temporary message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    } finally {
      setSending(false);
    }
  };

  if (initializing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
          <Loader size={32} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center sm:items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
              {host?.name ? host.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="ml-3">
              <h3 className="font-medium">{host?.name || 'Unknown Host'}</h3>
              <p className="text-sm text-gray-500">Host</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  msg.sender_id === user?.id
                    ? 'bg-orange-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-orange-100' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={sending}
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatDialog;