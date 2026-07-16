import { useState } from 'react';
import { Search, Send, MoreVertical, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

// In a real app we would use a hook like useMessages() here.
const contacts: any[] = [];

export function SellerMessagesPage() {
  const [activeContact, setActiveContact] = useState(contacts[0] || null);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Contacts List */}
      <div className="w-full md:w-80 bg-background rounded-2xl border border-border-light shadow-sm flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-border-light">
          <h2 className="text-lg font-bold text-text-primary mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary p-4 text-center">
              <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Aucune conversation</p>
            </div>
          ) : contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={cn(
                "w-full flex items-start p-4 border-b border-border-light transition-colors text-left",
                activeContact.id === contact.id ? "bg-accent/5" : "hover:bg-surface"
              )}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                  {contact.avatar}
                </div>
                {contact.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background">
                    {contact.unread}
                  </span>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={cn("text-sm truncate", contact.unread > 0 ? "font-bold text-text-primary" : "font-medium text-text-secondary")}>
                    {contact.name}
                  </h3>
                  <span className="text-xs text-text-tertiary ml-2 flex-shrink-0">{contact.time}</span>
                </div>
                <p className={cn("text-xs truncate", contact.unread > 0 ? "font-medium text-text-primary" : "text-text-secondary")}>
                  {contact.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-background rounded-2xl border border-border-light shadow-sm flex flex-col overflow-hidden">
        {!activeContact ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary p-4 text-center">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-text-primary">Sélectionnez une conversation</p>
            <p className="text-sm mt-2">Choisissez un contact dans la liste pour commencer à discuter.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border-light flex justify-between items-center bg-surface/50">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold mr-3">
                  {activeContact.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">{activeContact.name}</h3>
                  <p className="text-xs text-success">En ligne</p>
                </div>
              </div>
              <button className="p-2 text-text-secondary hover:bg-surface rounded-full">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-2/30">
              <div className="flex justify-center">
                <span className="text-xs text-text-tertiary bg-surface px-2 py-1 rounded-full">Aujourd'hui</span>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-surface border border-border-light rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm text-text-primary">Bonjour, le produit est-il toujours disponible ?</p>
                  <p className="text-[10px] text-text-tertiary mt-1 text-right">10:30</p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-accent text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm">Bonjour Jean, oui tout à fait ! De quelle quantité avez-vous besoin ?</p>
                  <p className="text-[10px] text-white/70 mt-1 text-right">10:35</p>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border-light bg-background">
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-text-secondary hover:bg-surface hover:text-accent rounded-xl transition-colors">
                  <ImageIcon className="h-5 w-5" />
                </button>
                <input 
                  type="text" 
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <button className="p-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
