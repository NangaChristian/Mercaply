const fs = require('fs');

const code = `import { useState, useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  conversationId: string;
  participants?: string[];
  senderId: string;
  content: string;
  timestamp: any;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: any;
  otherUser?: any;
  unreadCount?: number;
}

const getLocalItem = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e) { return []; }
};

const setLocalItem = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    const fetchConversations = async () => {
      // Mock with local storage
      const allConvs = getLocalItem('mock_conversations');
      const allMsgs = getLocalItem('mock_messages');
      
      const userConvs = allConvs.filter(c => c.participants.includes(user.uid));
      
      const convs = await Promise.all(userConvs.map(async (conv: any) => {
        const otherUserId = conv.participants.find((id: string) => id !== user.uid);
        let otherUser = null;
        if (otherUserId && supabase) {
          try {
             const { data: profile } = await supabase.from('profiles').select('*').eq('id', otherUserId).single();
             otherUser = profile;
          } catch(e) {}
        }
        
        const unreadCount = allMsgs.filter(m => m.conversationId === conv.id && m.senderId !== user.uid && !m.isRead).length;
        
        return {
          ...conv,
          otherUser: otherUser || { id: otherUserId, first_name: 'Utilisateur', last_name: '' },
          unreadCount
        } as Conversation;
      }));
      
      setConversations(convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      setIsLoading(false);
    };

    fetchConversations();
    
    const interval = setInterval(fetchConversations, 2000);
    return () => clearInterval(interval);
  }, [user]);

  // Load messages
  useEffect(() => {
    if (!activeConversationId || !user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const allMsgs = getLocalItem('mock_messages');
      const convMsgs = allMsgs.filter(m => m.conversationId === activeConversationId);
      
      setMessages(convMsgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      
      // Mark as read
      let updated = false;
      const newAllMsgs = allMsgs.map(m => {
        if (m.conversationId === activeConversationId && m.senderId !== user.uid && !m.isRead) {
           updated = true;
           return { ...m, isRead: true };
        }
        return m;
      });
      
      if (updated) {
        setLocalItem('mock_messages', newAllMsgs);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [activeConversationId, user]);

  const sendMessage = async (content: string) => {
    if (!activeConversationId || !user || !content.trim()) return;
    
    const activeConv = conversations.find(c => c.id === activeConversationId);
    if (!activeConv) return;
    
    const newMessage = {
      id: Math.random().toString(36).substring(7),
      conversationId: activeConversationId,
      participants: activeConv.participants,
      senderId: user.uid,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    const allMsgs = getLocalItem('mock_messages');
    allMsgs.push(newMessage);
    setLocalItem('mock_messages', allMsgs);
    
    const allConvs = getLocalItem('mock_conversations');
    const convIdx = allConvs.findIndex(c => c.id === activeConversationId);
    if (convIdx > -1) {
      allConvs[convIdx].lastMessage = content.trim();
      allConvs[convIdx].updatedAt = new Date().toISOString();
      setLocalItem('mock_conversations', allConvs);
    }
  };

  const startConversation = async (otherUserId: string, initialMessage?: string) => {
     if (!user) return null;
     
     const allConvs = getLocalItem('mock_conversations');
     let existing = allConvs.find(c => c.participants.includes(user.uid) && c.participants.includes(otherUserId));
     
     let convId = existing?.id;
     
     if (!existing) {
        convId = Math.random().toString(36).substring(7);
        allConvs.push({
           id: convId,
           participants: [user.uid, otherUserId],
           updatedAt: new Date().toISOString(),
           lastMessage: initialMessage || ''
        });
        setLocalItem('mock_conversations', allConvs);
     }
     
     if (initialMessage) {
        const newMessage = {
          id: Math.random().toString(36).substring(7),
          conversationId: convId,
          participants: [user.uid, otherUserId],
          senderId: user.uid,
          content: initialMessage,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        const allMsgs = getLocalItem('mock_messages');
        allMsgs.push(newMessage);
        setLocalItem('mock_messages', allMsgs);
     }
     
     setActiveConversationId(convId);
     return convId;
  };

  return {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    startConversation,
    isLoading
  };
}
`;
fs.writeFileSync('src/hooks/useMessages.ts', code);
