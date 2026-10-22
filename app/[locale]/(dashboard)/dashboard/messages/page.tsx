'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations, useLocale } from 'next-intl';
import { 
  MessageSquare,
  Search,
  Star,
  Archive,
  User,
  Clock
} from 'lucide-react';

const mockConversations = [
  {
    id: 1,
    sessionId: 'sess-001',
    leadName: 'Jennifer Martinez',
    email: 'jennifer.m@email.com',
    phone: '+1 (555) 123-4567',
    practiceArea: 'Personal Injury',
    status: 'new-lead',
    lastMessage: "Thank you! I'll wait for the attorney to contact me.",
    lastMessageTime: '2024-04-20T15:30:00Z',
    messages: [
      { role: 'assistant', content: 'Hello! How can I help you today?', timestamp: '2024-04-20T15:20:00Z' },
      { role: 'user', content: 'I was in a car accident last week and need legal help', timestamp: '2024-04-20T15:21:00Z' },
      { role: 'assistant', content: "I'm sorry to hear that. Can you tell me a bit more about what happened?", timestamp: '2024-04-20T15:21:30Z' },
      { role: 'user', content: 'I was rear-ended at a red light. The other driver was texting.', timestamp: '2024-04-20T15:22:00Z' },
      { role: 'assistant', content: 'Were you injured in the accident?', timestamp: '2024-04-20T15:22:30Z' },
      { role: 'user', content: 'Yes, I have neck and back pain. Went to ER.', timestamp: '2024-04-20T15:23:00Z' },
      { role: 'assistant', content: 'I understand. To better assist you, can I get your name and contact information?', timestamp: '2024-04-20T15:23:30Z' },
      { role: 'user', content: 'Jennifer Martinez, jennifer.m@email.com, 555-123-4567', timestamp: '2024-04-20T15:25:00Z' },
      { role: 'assistant', content: 'Thank you Jennifer. One of our attorneys will contact you within 24 hours to discuss your case.', timestamp: '2024-04-20T15:26:00Z' },
      { role: 'user', content: "Thank you! I'll wait for the attorney to contact me.", timestamp: '2024-04-20T15:30:00Z' }
    ],
    isStarred: true,
    isRead: false
  },
  {
    id: 2,
    sessionId: 'sess-002',
    leadName: 'Thomas Anderson',
    email: 'tanderson@email.com',
    phone: '+1 (555) 234-5678',
    practiceArea: 'Family Law',
    status: 'qualified',
    lastMessage: 'Perfect, see you then.',
    lastMessageTime: '2024-04-19T11:45:00Z',
    messages: [
      { role: 'assistant', content: 'Welcome! How may I assist you?', timestamp: '2024-04-19T11:30:00Z' },
      { role: 'user', content: 'I need help with a divorce', timestamp: '2024-04-19T11:31:00Z' },
      { role: 'assistant', content: 'I can help connect you with a family law attorney. Do you have children?', timestamp: '2024-04-19T11:31:30Z' },
      { role: 'user', content: 'Yes, two kids ages 7 and 10', timestamp: '2024-04-19T11:32:00Z' },
      { role: 'assistant', content: 'We can help with custody arrangements. Would you like to schedule a consultation?', timestamp: '2024-04-19T11:33:00Z' },
      { role: 'user', content: 'Yes please', timestamp: '2024-04-19T11:34:00Z' },
      { role: 'assistant', content: 'Great! I have availability tomorrow at 2pm or Friday at 10am. Which works better?', timestamp: '2024-04-19T11:35:00Z' },
      { role: 'user', content: 'Friday at 10am works', timestamp: '2024-04-19T11:40:00Z' },
      { role: 'assistant', content: 'Confirmed for Friday at 10am. Please check your email for the confirmation.', timestamp: '2024-04-19T11:42:00Z' },
      { role: 'user', content: 'Perfect, see you then.', timestamp: '2024-04-19T11:45:00Z' }
    ],
    isStarred: false,
    isRead: true
  },
  {
    id: 3,
    sessionId: 'sess-003',
    leadName: null,
    email: null,
    phone: null,
    practiceArea: null,
    status: 'abandoned',
    lastMessage: 'Just looking',
    lastMessageTime: '2024-04-18T09:15:00Z',
    messages: [
      { role: 'assistant', content: 'Hello! How can I help you today?', timestamp: '2024-04-18T09:10:00Z' },
      { role: 'user', content: 'How much do you charge?', timestamp: '2024-04-18T09:12:00Z' },
      { role: 'assistant', content: 'Our fees vary depending on the type of case. What kind of legal matter do you need help with?', timestamp: '2024-04-18T09:13:00Z' },
      { role: 'user', content: 'Just looking', timestamp: '2024-04-18T09:15:00Z' }
    ],
    isStarred: false,
    isRead: true
  }
];

const statusConfig = {
  'new-lead': { labelKey: 'newLeadStatus', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  'qualified': { labelKey: 'qualified', color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  'abandoned': { labelKey: 'abandoned', color: 'bg-white/5 text-gray-400 border border-white/10' },
  'converted': { labelKey: 'converted', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' }
};

export default function MessagesPage() {
  const t = useTranslations('messages');
  const locale = useLocale();
  const isEs = locale === 'es';
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <section aria-labelledby="messages-title" className="max-w-3xl space-y-4">
      <h1 id="messages-title" className="text-3xl font-serif italic tracking-tight text-[#DEDBC8]">
        {isEs ? 'Mensajes' : 'Messages'}
      </h1>
      <div role="status" className="rounded-lg border border-white/10 bg-[#101010] p-6">
        <h2 className="text-lg font-medium text-white">
          {isEs ? 'Bandeja de mensajes no conectada' : 'Message inbox is not connected'}
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          {isEs
            ? 'Las conversaciones de demostración se retiraron. Aquí aparecerán solo mensajes reales guardados de tu firma.'
            : 'Demo conversations have been removed. Only real, persisted messages from your firm will appear here.'}
        </p>
      </div>
    </section>
  );

  const filteredConversations = mockConversations.filter(conv =>
    (conv.leadName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (conv.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (conv.practiceArea?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return t('minutesAgo', { minutes: diffMins });
    if (diffHours < 24) return t('hoursAgo', { hours: diffHours });
    if (diffDays < 7) return t('daysAgo', { days: diffDays });
    return time.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif italic tracking-tight text-[#DEDBC8]">{t('title')}</h1>
        <p className="text-gray-400 mt-2 text-sm">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('totalConversations')}</CardDescription>
            <CardTitle className="text-3xl text-white">{mockConversations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('newLeads')}</CardDescription>
            <CardTitle className="text-3xl text-blue-400">
              {mockConversations.filter(c => c.status === 'new-lead').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('qualified')}</CardDescription>
            <CardTitle className="text-3xl text-green-400">
              {mockConversations.filter(c => c.status === 'qualified').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('unread')}</CardDescription>
            <CardTitle className="text-3xl text-orange-400">
              {mockConversations.filter(c => !c.isRead).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content - Inbox Style */}
      <Card className="overflow-hidden border border-white/5 bg-[#101010] shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-white/5 h-[600px]">
          {/* Conversation List */}
          <div className="overflow-y-auto">
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder={t('searchConversations')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-white/10 bg-[#1A1A1A] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                    selectedConversation.id === conv.id ? 'bg-white/5' : ''
                  } ${!conv.isRead ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium truncate text-gray-200 ${!conv.isRead ? 'font-semibold text-white' : ''}`}>
                          {conv.leadName || t('unknownVisitor')}
                        </p>
                        {conv.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusConfig[conv.status as keyof typeof statusConfig].color
                        }`}>
                          {t(statusConfig[conv.status as keyof typeof statusConfig].labelKey as keyof typeof t)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(conv.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{selectedConversation.leadName || t('unknownVisitor')}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        {selectedConversation.email && <span>{selectedConversation.email}</span>}
                        {selectedConversation.phone && <span>· {selectedConversation.phone}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                        {t('convertToLead')}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0F15]">
                  {selectedConversation.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-[#101010] border border-white/5 shadow-xl text-gray-200'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-2">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-white/5 bg-[#0B0F15]">
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      {t('createLeadFromConversation')}
                    </Button>
                    <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                      {t('downloadTranscript')}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>{t('selectConversation')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
