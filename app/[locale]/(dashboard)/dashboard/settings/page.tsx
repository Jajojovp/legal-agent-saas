'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Building2,
  Users,
  Bell,
  Zap,
  CreditCard,
  Shield,
  Globe,
  Mail
} from 'lucide-react';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const isEs = locale === 'es';
  const [activeTab, setActiveTab] = useState('firm');

  const tabs = [
    { id: 'firm', label: t('firmProfile'), icon: Building2 },
    { id: 'team', label: t('teamMembers'), icon: Users },
    { id: 'integrations', label: t('integrations'), icon: Zap },
    { id: 'billing', label: t('billingPlan'), icon: CreditCard },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'security', label: t('security'), icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif italic tracking-tight text-[#DEDBC8]">{t('title')}</h1>
        <p className="text-gray-400 mt-2 text-sm">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="border border-white/5 bg-[#101010] shadow-xl">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Firm Profile */}
          {activeTab === 'firm' && (
            <Card className="border border-white/5 bg-[#101010] shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">{t('firmProfile')}</CardTitle>
                <CardDescription className="text-gray-400">{t('updateFirmInfo')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firm-name" className="text-gray-300">{t('firmName')}</Label>
                    <Input id="firm-name" defaultValue="Demo Law Firm" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firm-email" className="text-gray-300">{t('contactEmail')}</Label>
                    <Input id="firm-email" type="email" defaultValue="contact@demolaw.com" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firm-phone" className="text-gray-300">{t('phone')}</Label>
                    <Input id="firm-phone" defaultValue="+1 (555) 123-4567" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firm-website" className="text-gray-300">{t('website')}</Label>
                    <Input id="firm-website" defaultValue="https://demolaw.com" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firm-address" className="text-gray-300">{t('address')}</Label>
                  <Input id="firm-address" defaultValue="123 Main Street" className="border-white/10 bg-[#1A1A1A] text-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firm-city" className="text-gray-300">{t('city')}</Label>
                    <Input id="firm-city" defaultValue="New York" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firm-state" className="text-gray-300">{t('state')}</Label>
                    <Input id="firm-state" defaultValue="NY" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firm-zip" className="text-gray-300">{t('zipCode')}</Label>
                    <Input id="firm-zip" defaultValue="10001" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">{t('practiceAreas')}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Personal Injury',
                      'Family Law',
                      'Criminal Defense',
                      'Estate Planning',
                      'Business Law',
                      'Real Estate',
                      'Immigration',
                      'Employment Law'
                    ].map((area) => (
                      <label key={area} className="flex items-center gap-2 text-sm text-gray-300">
                        <input type="checkbox" defaultChecked={area === 'Personal Injury' || area === 'Family Law'} />
                        {area}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">{t('cancel')}</Button>
                  <Button>{t('saveChanges')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members */}
          {activeTab === 'team' && (
            <Card className="border border-white/5 bg-[#101010] shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{t('teamMembers')}</CardTitle>
                    <CardDescription className="text-gray-400">{t('manageTeam')}</CardDescription>
                  </div>
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    {t('inviteMember')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Jane Doe', role: 'Managing Attorney', email: 'jane@demolaw.com', status: 'Active' },
                    { name: 'John Attorney', role: 'Associate Attorney', email: 'john@demolaw.com', status: 'Active' },
                    { name: 'Sarah Assistant', role: 'Paralegal', email: 'sarah@demolaw.com', status: 'Active' }
                  ].map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-sm text-gray-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-300">{member.role}</p>
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                            {t('active')}
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">{isEs ? 'Editar' : 'Edit'}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <Card className="border border-white/5 bg-[#101010] shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">{t('integrations')}</CardTitle>
                <CardDescription className="text-gray-400">{t('manageIntegrations')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      name: 'Google Calendar', 
                      description: isEs ? 'Sincroniza plazos de casos y citas' : 'Sync case deadlines and appointments',
                      icon: Globe,
                      connected: true,
                      category: isEs ? 'Productividad' : 'Productivity'
                    },
                    { 
                      name: 'Stripe', 
                      description: isEs ? 'Acepta pagos en línea de clientes' : 'Accept online payments from clients',
                      icon: CreditCard,
                      connected: false,
                      category: isEs ? 'Pagos' : 'Payments'
                    },
                    { 
                      name: 'Resend', 
                      description: isEs ? 'Notificaciones de email automatizadas' : 'Automated email notifications',
                      icon: Mail,
                      connected: true,
                      category: 'Email'
                    },
                    { 
                      name: 'Calendly', 
                      description: isEs ? 'Agendamiento de citas con clientes' : 'Client appointment scheduling',
                      icon: Globe,
                      connected: false,
                      category: isEs ? 'Agendamiento' : 'Scheduling'
                    }
                  ].map((integration, idx) => {
                    const Icon = integration.icon;
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{integration.name}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                                {integration.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">{integration.description}</p>
                          </div>
                        </div>
                        {integration.connected ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-400 font-medium">{t('connected')}</span>
                            <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">{t('configure')}</Button>
                          </div>
                        ) : (
                          <Button size="sm">{t('connect')}</Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing & Plans */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card className="border border-white/5 bg-[#101010] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white">{t('currentPlan')}</CardTitle>
                  <CardDescription className="text-gray-400">{t('currentPlanSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                    <div>
                      <h3 className="font-semibold text-lg text-white">{t('professionalPlan')}</h3>
                      <p className="text-sm text-gray-400">{t('planDetails')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">$399</p>
                      <p className="text-sm text-gray-400">{t('perMonth')}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('nextBillingDate')}</span>
                      <span className="font-medium text-gray-200">May 1, 2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('aiQueriesUsed')}</span>
                      <span className="font-medium text-gray-200">247 / 500</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[49%]" />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">{t('changePlan')}</Button>
                    <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">{t('cancelSubscription')}</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-white/5 bg-[#101010] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white">{t('paymentMethod')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-white">Visa ending in 4242</p>
                        <p className="text-sm text-gray-400">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">{t('update')}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card className="border border-white/5 bg-[#101010] shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">{t('notificationPreferences')}</CardTitle>
                <CardDescription className="text-gray-400">{t('manageNotifications')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-200 mb-3">{t('emailNotifications')}</h4>
                  <div className="space-y-3">
                    {[
                      { label: isEs ? 'Nuevo prospecto captado' : 'New lead captured', description: isEs ? 'Recibe notificación cuando el chatbot captura un nuevo prospecto' : 'Get notified when chatbot captures a new lead' },
                      { label: isEs ? 'Plazos de tareas' : 'Task deadlines', description: isEs ? 'Recordatorios para próximos plazos de casos' : 'Reminders for upcoming case deadlines' },
                      { label: isEs ? 'Pago recibido' : 'Payment received', description: isEs ? 'Confirmaciones de pago de facturas' : 'Invoice payment confirmations' },
                      { label: isEs ? 'Menciones del equipo' : 'Team mentions', description: isEs ? 'Cuando alguien te menciona en una nota' : 'When someone mentions you in a note' }
                    ].map((notif, idx) => (
                      <label key={idx} className="flex items-start gap-3 p-3 border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                        <input type="checkbox" defaultChecked={idx < 2} className="mt-1" />
                        <div>
                          <p className="font-medium text-sm text-gray-200">{notif.label}</p>
                          <p className="text-xs text-gray-400">{notif.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-200 mb-3">{t('smsNotifications')}</h4>
                  <div className="space-y-3">
                    {[
                      { label: isEs ? 'Plazos urgentes' : 'Urgent deadlines', description: isEs ? 'Plazos críticos dentro de 24 horas' : 'Critical deadlines within 24 hours' },
                      { label: isEs ? 'Prospectos de alto valor' : 'High-value leads', description: isEs ? 'Prospectos con puntuación IA de 80+' : 'Leads with 80+ AI score' }
                    ].map((notif, idx) => (
                      <label key={idx} className="flex items-start gap-3 p-3 border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                        <input type="checkbox" defaultChecked={idx === 0} className="mt-1" />
                        <div>
                          <p className="font-medium text-sm text-gray-200">{notif.label}</p>
                          <p className="text-xs text-gray-400">{notif.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>{t('savePreferences')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card className="border border-white/5 bg-[#101010] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white">{t('password')}</CardTitle>
                  <CardDescription className="text-gray-400">{t('updatePassword')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-gray-300">{t('currentPassword')}</Label>
                    <Input id="current-password" type="password" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-gray-300">{t('newPassword')}</Label>
                    <Input id="new-password" type="password" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-300">{t('confirmPassword')}</Label>
                    <Input id="confirm-password" type="password" className="border-white/10 bg-[#1A1A1A] text-white" />
                  </div>
                  <Button>{t('updatePasswordBtn')}</Button>
                </CardContent>
              </Card>

              <Card className="border border-white/5 bg-[#101010] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white">{t('twoFactor')}</CardTitle>
                  <CardDescription className="text-gray-400">{t('twoFactorSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl">
                    <div>
                      <p className="font-medium text-white">{t('twoFactorStatus')}</p>
                      <p className="text-sm text-gray-400">{t('twoFactorDisabled')}</p>
                    </div>
                    <Button>{t('enable2fa')}</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-white/5 bg-[#101010] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white">{t('activeSessions')}</CardTitle>
                  <CardDescription className="text-gray-400">{t('activeSessionsSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { device: 'Chrome on Windows', location: 'New York, US', lastActive: isEs ? 'hace 2 minutos' : '2 minutes ago', current: true },
                    { device: 'Safari on iPhone', location: 'New York, US', lastActive: isEs ? 'hace 3 horas' : '3 hours ago', current: false }
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-white/5 rounded-xl">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-white">{session.device}</p>
                          {session.current && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                              {t('current')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{session.location} · {session.lastActive}</p>
                      </div>
                      {!session.current && (
                        <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">{t('revoke')}</Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
