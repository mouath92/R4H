import { supabase } from './supabase';

export const initializeChat = async (userId: string, hostId: string, spaceId?: string) => {
  try {
    console.log('Initializing chat with params:', { userId, hostId, spaceId });

    // First check if a conversation already exists between these users for this space
    const { data: existingParticipations, error: participationsError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner (
          id,
          space_id
        )
      `)
      .eq('user_id', userId);

    if (participationsError) {
      console.error('Error fetching user participations:', participationsError);
      throw participationsError;
    }

    // Filter conversations to find one with both users and matching space_id
    const userConversations = existingParticipations.map(p => ({
      id: p.conversation_id,
      spaceId: p.conversations.space_id
    }));

    if (userConversations.length > 0) {
      const { data: hostParticipations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', hostId)
        .in('conversation_id', userConversations.map(c => c.id));

      const sharedConversation = userConversations.find(conv => 
        hostParticipations?.some(p => p.conversation_id === conv.id) &&
        conv.spaceId === spaceId
      );

      if (sharedConversation) {
        console.log('Found existing conversation:', sharedConversation.id);
        return sharedConversation.id;
      }
    }

    // No existing conversation found, create a new one
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert([{ space_id: spaceId }])
      .select()
      .single();

    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      throw conversationError;
    }

    console.log('Created new conversation:', newConversation.id);

    // Check for existing participants before inserting
    const { data: existingParticipants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', newConversation.id);

    const existingUserIds = new Set(existingParticipants?.map(p => p.user_id) || []);
    const participantsToAdd = [];

    if (!existingUserIds.has(userId)) {
      participantsToAdd.push({ conversation_id: newConversation.id, user_id: userId });
    }

    if (!existingUserIds.has(hostId)) {
      participantsToAdd.push({ conversation_id: newConversation.id, user_id: hostId });
    }

    if (participantsToAdd.length > 0) {
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantsToAdd);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        throw participantsError;
      }
    }

    return newConversation.id;
  } catch (error) {
    console.error('Error in initializeChat:', error);
    throw error;
  }
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          name,
          email,
          role
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};