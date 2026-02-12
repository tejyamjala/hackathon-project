import { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Clock,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage } from '@/types';
import { cn, formatRelativeTime, generateId } from '@/lib/utils';
import { useApp, usePatientChat } from '@/context/AppContext';

export function DepartmentChat() {
  const { state, dispatch } = useApp();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(state.patients[0]?.id || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedPatient = state.patients.find(p => p.id === selectedPatientId);
  const messages = selectedPatientId ? usePatientChat(state, selectedPatientId) : [];

  // Filter patients with chat activity
  const patientsWithChat = state.patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedPatientId) return;

    const newMessage: ChatMessage = {
      id: generateId('msg'),
      patientId: selectedPatientId,
      senderId: state.currentUser.id,
      senderName: state.currentUser.name,
      senderRole: state.currentUser.role,
      department: state.currentUser.department,
      message: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: newMessage });
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex">
      {/* Patient List Sidebar */}
      <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sky-500" />
            Patient Chats
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {patientsWithChat.map(patient => {
              const patientMessages = state.chatMessages.filter(m => m.patientId === patient.id);
              const lastMessage = patientMessages[patientMessages.length - 1];
              const unreadCount = patientMessages.filter(m => 
                m.senderId !== state.currentUser.id &&
                new Date(m.timestamp).getTime() > Date.now() - 3600000
              ).length;

              return (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors",
                    selectedPatientId === patient.id 
                      ? "bg-sky-100 border border-sky-200" 
                      : "hover:bg-white border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm bg-slate-200 text-slate-700">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{patient.name}</p>
                        {unreadCount > 0 && (
                          <Badge variant="default" className="text-[10px] h-5 min-w-5">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{patient.mrn}</p>
                      {lastMessage && (
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {lastMessage.senderName}: {lastMessage.message}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedPatient ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-sky-100 text-sky-700">
                    {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{selectedPatient.name}</h4>
                  <p className="text-xs text-slate-500">
                    {selectedPatient.mrn} • {selectedPatient.department} • {selectedPatient.bedNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {messages.length} messages
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation about this patient</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = message.senderId === state.currentUser.id;
                    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          isOwn && "flex-row-reverse"
                        )}
                      >
                        {showAvatar ? (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className={cn(
                              "text-xs",
                              isOwn ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-700"
                            )}>
                              {message.senderName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}
                        
                        <div className={cn(
                          "max-w-[70%]",
                          isOwn && "items-end"
                        )}>
                          {showAvatar && (
                            <div className={cn(
                              "flex items-center gap-2 mb-1",
                              isOwn && "flex-row-reverse"
                            )}>
                              <span className="text-xs font-medium">{message.senderName}</span>
                              <span className="text-xs text-slate-400">{message.department}</span>
                            </div>
                          )}
                          <div className={cn(
                            "px-4 py-2 rounded-2xl text-sm",
                            isOwn 
                              ? "bg-sky-500 text-white rounded-tr-sm" 
                              : "bg-slate-100 text-slate-800 rounded-tl-sm"
                          )}>
                            {message.message}
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 mt-1 text-xs text-slate-400",
                            isOwn && "justify-end"
                          )}>
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-5 w-5 text-slate-400" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a patient to view chat</p>
              <p className="text-sm">Coordinate care with other departments</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
