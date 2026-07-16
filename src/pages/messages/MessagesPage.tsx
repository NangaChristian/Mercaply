// @ts-nocheck
import { db, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from '../../lib/supabase-compat';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, MoreVertical, Image as ImageIcon, Smile, ChevronLeft, Store, ShieldCheck, Flag, Archive, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useMessages, Conversation, Message } from '../../hooks/useMessages';
import { useAuth } from '../../store/useAuth';

export function MessagesPage() {
  const { user } = useAuth();
  const { conversations, messages, activeConversationId, setActiveConversationId, sendMessage, isLoading } = useMessages();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConv]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessage(messageText.trim());
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'unread' && !conv.unreadCount) return false;
    if (activeTab === 'sellers' && conv.otherUser?.role !== 'seller') return false;
    if (activeTab === 'buyers' && conv.otherUser?.role !== 'buyer') return false;
    
    return conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           conv.otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectConv = (convId: string) => {
    setActiveConversationId(convId);
    setIsMobileChatOpen(true);
  };

  const formatMsgTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarLetter = (name: string, email: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return '?';
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="animate-spin text-accent"><Send className="w-8 h-8"/></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full h-[calc(100vh-80px)]">
      <div className="bg-background rounded-2xl border border-border-light shadow-sm overflow-hidden flex h-[calc(100vh-140px)] min-h-[600px] w-full">
      
      {/* Left Column - Conversations List */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 flex flex-col border-r border-border-light flex-shrink-0 transition-transform duration-300",
        isMobileChatOpen ? 'hidden md:flex' : 'flex'
      )}>
        {/* Header & Search */}
        <div className="p-4 border-b border-border-light">
          <h1 className="text-xl font-bold text-text-primary mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-border-light px-2">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'sellers', label: 'Vendeurs' },
            { id: 'unread', label: 'Non lus' }
          ].map(tab => (
             <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id 
                  ? "border-accent text-accent" 
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-text-tertiary">
              <p className="text-sm">Aucune conversation trouvée.</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const otherUser = conv.otherUser;
              return (
              <button
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={cn(
                  "w-full flex items-start p-4 border-b border-border-light transition-colors text-left",
                  activeConversationId === conv.id ? "bg-accent/5" : "hover:bg-surface"
                )}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg uppercase">
                    {getAvatarLetter(otherUser?.name, otherUser?.email)}
                  </div>
                  {(conv.unreadCount || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-background shadow-sm">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={cn("text-sm truncate flex items-center", conv.unreadCount ? "font-bold text-text-primary" : "font-medium text-text-primary")}>
                      {otherUser?.name || otherUser?.email || 'Utilisateur inconnu'}
                      {otherUser?.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-success ml-1 flex-shrink-0" />}
                    </h3>
                  </div>
                  <p className={cn("text-sm truncate", conv.unreadCount ? "font-medium text-text-primary" : "text-text-secondary")}>
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            )})
          )}
        </div>
      </div>

      {/* Right Column - Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-surface-2/30",
        !isMobileChatOpen ? 'hidden md:flex' : 'flex'
      )}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 border-b border-border-light bg-background flex justify-between items-center flex-shrink-0">
              <div className="flex items-center">
                <button 
                  onClick={() => setIsMobileChatOpen(false)}
                  className="md:hidden mr-3 p-2 text-text-secondary hover:bg-surface rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="relative mr-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold uppercase">
                    {getAvatarLetter(activeConv.otherUser?.name, activeConv.otherUser?.email)}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm flex items-center">
                    {activeConv.otherUser?.name || activeConv.otherUser?.email || 'Utilisateur inconnu'}
                    {activeConv.otherUser?.isVerified && <ShieldCheck className="h-4 w-4 text-success ml-1" />}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {activeConv.otherUser?.role === 'seller' ? 'Vendeur' : 'Acheteur'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {activeConv.otherUser?.role === 'seller' && (
                  <Link to={`/seller/${activeConv.otherUser.uid}`} className="hidden sm:flex text-sm font-medium text-accent hover:underline items-center px-3 py-1.5 bg-accent/10 rounded-lg">
                    <Store className="h-4 w-4 mr-1.5" />
                    Voir boutique
                  </Link>
                )}
                
                {/* Actions Menu */}
                <div className="relative group">
                  <button className="p-2 text-text-secondary hover:bg-surface rounded-full transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-background border border-border-light rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/10 last:rounded-b-xl flex items-center border-t border-border-light">
                      <Flag className="h-4 w-4 mr-2" /> Signaler
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] sm:max-w-[75%] px-4 py-2.5 shadow-sm",
                    msg.senderId === user?.uid 
                      ? "bg-accent text-white rounded-2xl rounded-tr-sm" 
                      : "bg-surface border border-border-light text-text-primary rounded-2xl rounded-tl-sm"
                  )}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <div className={cn(
                      "flex items-center justify-end mt-1 space-x-1",
                      msg.senderId === user?.uid ? "text-white/70" : "text-text-tertiary"
                    )}>
                      <span className="text-[10px]">{formatMsgTime(msg.timestamp)}</span>
                      {msg.senderId === user?.uid && (
                        <svg viewBox="0 0 16 16" fill="none" className={cn("w-3 h-3", msg.isRead ? "text-blue-300" : "currentColor")}>
                          <path d="M11.4669 3.72684C11.7958 3.34436 12.3622 3.30325 12.7313 3.63484C13.1003 3.96643 13.1332 4.5452 12.8043 4.92768L7.85768 10.6865C7.50209 11.1003 6.84964 11.085 6.5146 10.655L3.25052 6.47197C2.9431 6.07817 2.99615 5.5029 3.36928 5.16911C3.74241 4.83532 4.29437 4.89868 4.60179 5.29248L7.22123 8.64966L11.4669 3.72684Z" fill="currentColor"/>
                          {msg.isRead && (
                            <path d="M15.4669 3.72684C15.7958 3.34436 16.3622 3.30325 16.7313 3.63484C17.1003 3.96643 17.1332 4.5452 16.8043 4.92768L11.8577 10.6865C11.5021 11.1003 10.8496 11.085 10.5146 10.655L9.25052 9.034C8.9431 8.6402 8.99615 8.06493 9.36928 7.73114C9.74241 7.39735 10.2944 7.46071 10.6018 7.85451L11.2212 8.64966L15.4669 3.72684Z" fill="currentColor" transform="translate(-4, 0)"/>
                          )}
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies for seller */}
            {user?.role === 'seller' && (
              <div className="px-4 py-2 bg-background border-t border-border-light flex gap-2 overflow-x-auto hide-scrollbar">
                <button 
                  onClick={() => setMessageText("Bonjour ! Comment puis-je vous aider ?")}
                  className="px-3 py-1.5 bg-surface text-text-secondary text-xs rounded-full border border-border-light whitespace-nowrap hover:bg-border-light hover:text-text-primary"
                >
                  Bonjour ! Comment puis-je vous aider ?
                </button>
                <button 
                  onClick={() => setMessageText("Le produit est toujours disponible en stock.")}
                  className="px-3 py-1.5 bg-surface text-text-secondary text-xs rounded-full border border-border-light whitespace-nowrap hover:bg-border-light hover:text-text-primary"
                >
                  Oui, toujours disponible en stock.
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border-light">
              <div className="flex items-end gap-2 bg-surface border border-border-light rounded-2xl p-2 focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent transition-all">
                <button className="p-2 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-xl transition-colors flex-shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-xl transition-colors hidden sm:block flex-shrink-0">
                  <Smile className="h-5 w-5" />
                </button>
                
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message..."
                  className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none resize-none px-2 py-2 text-[15px] focus:outline-none"
                  rows={1}
                />
                
                <button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="p-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-background">
             <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
               <Send className="h-10 w-10 text-text-tertiary" />
             </div>
             <h2 className="text-xl font-bold text-text-primary mb-2">Vos messages</h2>
             <p className="text-text-secondary max-w-md">
               Sélectionnez une conversation dans la liste pour commencer à discuter ou répondre à vos clients.
             </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
