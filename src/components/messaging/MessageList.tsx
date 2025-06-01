import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface MessageListProps {
  conversations: any[];
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  participantName: string;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ isOpen, onClose, onConfirm, participantName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle size={24} className="text-red-500 mr-2" />
            <h3 className="text-xl font-semibold">Delete Conversation</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete your conversation with {participantName}? This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={onConfirm}
          >
            Delete Conversation
          </Button>
        </div>
      </div>
    </div>
  );
};

const MessageList: React.FC<MessageListProps> = ({ conversations, onSelectConversation, onDeleteConversation }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const getOtherParticipant = (conversation: any) => {
    if (!conversation?.participants?.length) return null;
    return conversation.participants.find((p: any) => p.id !== user?.id) || null;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleDeleteClick = (conversation: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedConversation(conversation);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConversation) return;
    try {
      await onDeleteConversation(selectedConversation.id);
      setShowDeleteConfirmation(false);
      setSelectedConversation(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const sortedConversations = conversations
    .filter((conversation, index, self) =>
      index === self.findIndex((c) => c.id === conversation.id))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <div className="bg-white h-full">
      {sortedConversations.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No messages yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {sortedConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const role = otherParticipant?.role || 'user';
            const lastMessage = conversation.lastMessage;
            const senderName = lastMessage?.sender?.name || 'Unknown User';
            const isOwnMessage = lastMessage?.sender?.id === user?.id;

            return (
              <div
                key={conversation.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group"
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start">
                  <div className="relative mr-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                      {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {role === 'host' && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Host
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-medium text-gray-900">
                        {otherParticipant?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.updated_at)}
                      </span>
                    </div>
                    {conversation.space && (
                      <p className="text-xs text-blue-600 mb-1">
                        Re: {conversation.space.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 truncate">
                      {isOwnMessage ? 'You: ' : `${senderName}: `}
                      {lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(conversation, e)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full"
                    title="Delete conversation"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setSelectedConversation(null);
        }}
        onConfirm={handleDeleteConfirm}
        participantName={getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
      />
    </div>
  );
};

export default MessageList;

