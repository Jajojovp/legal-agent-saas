'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, FileText, Calendar, DollarSign, User,
  AlertCircle, CheckCircle, Clock, XCircle, Filter, ArrowUpRight
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Modal } from '@/components/ui/modal';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  intake: { label: 'Intake', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', icon: FileText },
  active: { label: 'Active', color: 'bg-green-500/10 text-green-400 border border-green-500/20', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', icon: Clock },
  'closed-won': { label: 'Closed - Won', color: 'bg-gray-500/10 text-gray-400 border border-gray-500/20', icon: CheckCircle },
  'closed-lost': { label: 'Closed - Lost', color: 'bg-red-500/10 text-red-400 border border-red-500/20', icon: XCircle },
};

const practiceAreaColors: Record<string, string> = {
  'Personal Injury': 'border-l-red-500',
  'Family Law': 'border-l-blue-500',
  'Criminal Defense': 'border-l-yellow-500',
  'Estate Planning': 'border-l-purple-500',
  'Business Law': 'border-l-green-500',
};

const mockCases = [
  {
    id: 1, caseNumber: 'CASE-2024-0142', clientName: 'John Smith',
    practiceArea: 'Personal Injury', status: 'active',
    assignedAttorney: 'Jane Doe',
    description: 'Car accident on Highway 101, rear-end collision',
    estimatedValue: 75000, createdAt: '2024-03-15T10:00:00Z',
    nextDeadline: '2024-04-25T09:00:00Z', nextDeadlineTask: 'File Motion to Compel',
  },
  {
    id: 2, caseNumber: 'CASE-2024-0141', clientName: 'Sarah Johnson',
    practiceArea: 'Family Law', status: 'intake',
    assignedAttorney: 'John Doe',
    description: 'Divorce proceeding with child custody dispute',
    estimatedValue: 45000, createdAt: '2024-03-14T14:30:00Z',
    nextDeadline: null, nextDeadlineTask: null,
  },
];

const statusFilters = ['all', 'intake', 'active', 'pending', 'closed-won', 'closed-lost'];

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewCase, setShowNewCase] = useState(false);
  const [newCase, setNewCase] = useState({ clientName: '', practiceArea: '', description: '' });

  const filteredCases = mockCases.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery && !c.clientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateCase = () => {
    console.log('Create case:', newCase);
    setShowNewCase(false);
    setNewCase({ clientName: '', practiceArea: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif italic text-[#DEDBC8]">Cases</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your firm&apos;s active cases</p>
        </div>
        <Button onClick={() => setShowNewCase(true)} className="bg-primary hover:bg-primary/90 text-black font-medium">
          <Plus className="h-4 w-4 mr-2" /> New Case
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#101010] border border-white/5 rounded-xl text-white placeholder:text-gray-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {s === 'all' ? 'All' : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <Card className="border border-white/5 bg-[#101010]">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-sm">No cases found matching your filters</p>
            </CardContent>
          </Card>
        ) : filteredCases.map((c) => {
          const status = statusConfig[c.status];
          const StatusIcon = status?.icon;
          return (
            <div
              key={c.id}
              className={`bg-[#101010] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors cursor-pointer ${practiceAreaColors[c.practiceArea] || ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-white">{c.clientName}</h3>
                    {status && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-1">{c.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {c.caseNumber}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {c.assignedAttorney}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${c.estimatedValue?.toLocaleString()}</span>
                    {c.nextDeadline && (
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {c.nextDeadlineTask}</span>
                    )}
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-600 shrink-0 mt-1" />
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showNewCase} onClose={() => setShowNewCase(false)} title="Create New Case">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Client Name</label>
            <input
              type="text" value={newCase.clientName}
              onChange={(e) => setNewCase({ ...newCase, clientName: e.target.value })}
              className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none text-sm"
              placeholder="Enter client name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Practice Area</label>
            <input
              type="text" value={newCase.practiceArea}
              onChange={(e) => setNewCase({ ...newCase, practiceArea: e.target.value })}
              className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none text-sm"
              placeholder="e.g., Personal Injury"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={newCase.description}
              onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none text-sm resize-none"
              rows={3}
              placeholder="Case description"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreateCase} className="bg-primary hover:bg-primary/90 text-black flex-1">Create Case</Button>
            <Button onClick={() => setShowNewCase(false)} variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
