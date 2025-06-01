import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Loader } from 'lucide-react';
import MessageList from '../components/messaging/MessageList';
import Conversation from '../components/messaging/Conversation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Messages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState<string | null>(id || null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const { data: conversationsData, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            updated_at,
            messages (
              id,
              content,
              created_at,
              sender:users!messages_sender_id_fkey (
                id,
                name,
                role
              )
            ),
            conversation_participants!inner (
              user_id,
              user:users!conversation_participants_user_id_fkey (
                id,
                name,
                email,
                role
              )
            )
          `)
          .eq('conversation_participants.user_id', user.id)
          .order('updated_at', { ascending: false });

        if (convError) throw convError;

        const conversationsWithMessages = conversationsData
          .filter(conv => conv.messages && conv.messages.length > 0)
          .map(conv => ({
            id: conv.id,
            participants: conv.conversation_participants.map((cp: any) => cp.user),
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            lastMessage: conv.messages[conv.messages.length - 1]
          }));

        setConversations(conversationsWithMessages);

        if (activeConversation && conversationsWithMessages.some(conv => conv.id === activeConversation)) {
          await fetchMessages(activeConversation);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, async payload => {
        const newMessage = payload.new;
        
        const { data: sender } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('id', newMessage.sender_id)
          .single();

        if (newMessage.conversation_id === activeConversation) {
          setMessages(prev => [...prev, { ...newMessage, sender }]);
        }

        setConversations(prev => {
          const conversationIndex = prev.findIndex(c => c.id === newMessage.conversation_id);
          if (conversationIndex === -1) {
            fetchConversations();
            return prev;
          }
          
          const updatedConversations = [...prev];
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            lastMessage: { ...newMessage, sender },
            updated_at: new Date().toISOString()
          };
          return updatedConversations;
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, activeConversation]);

  const fetchMessages = async (conversationId: string) => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender:users!messages_sender_id_fkey(
            id,
            name,
            email,
            role
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      if (user?.id) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('read', false);
      }

    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    setActiveConversation(conversationId);
    await fetchMessages(conversationId);
    navigate(`/messages/${conversationId}`);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversation || !user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // Delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Delete conversation participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId);

      if (participantsError) throw participantsError;

      // Delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      // Update local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // If the deleted conversation was active, clear it and navigate back
      if (activeConversation === conversationId) {
        setActiveConversation(null);
        setMessages([]);
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
        <Loader size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-14rem)]">
          <div className="md:col-span-1 border-r border-gray-200 overflow-y-auto">
            <MessageList 
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
          
          <div className="md:col-span-2 flex flex-col h-full">
            {activeConversation ? (
              <Conversation 
                messages={messages}
                conversationId={activeConversation}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <div className="h-12 w-12 text-gray-400 mx-auto mb-4">
                    <MessageCircle size={48} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
                  <p className="mt-1 text-gray-500">
                    Select a conversation to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;