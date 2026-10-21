import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Wifi, 
  User as UserIcon, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../features/auth/auth-context';
import { UserRole } from '../../types';
import { apiClient } from '../../services/api/client';
import { Badge } from '../ui/badge';

export const Header: React.FC = () => {
  const location = useLocation();
  const { currentUser, currentRole, loginAsRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Derive readable breadcrumb from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ') || 'Overview';

  const ROLES: { id: UserRole; label: string }[] = [
    { id: 'admin', label: 'Platform Administrator' },
    { id: 'owner', label: 'Fleet Owner' },
    { id: 'reviewer', label: 'Safety Reviewer' },
    { id: 'tester', label: 'AI Device Tester' },
    { id: 'driver', label: 'Commercial Driver' },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between select-none z-20">
      {/* Left: Context Breadcrumb */}
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-xs font-semibold text-slate-700 tracking-tight flex items-center gap-1.5">
          <span className="text-slate-400">SafeDrive</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{breadcrumb}</span>
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Operating Mode Indicator */}
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-brand-700 border border-blue-200">
          {apiClient.isDemoMode() ? 'Mock Store • In-Memory Session' : 'Real API Endpoint'}
        </span>

        {/* Sync Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-medium">Edge Fleet Connected (7/8 Online)</span>
        </div>

        {/* Interactive Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            title="Switch Testing Persona"
          >
            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline font-semibold">{currentUser?.name?.split(' ')[0] || 'User'}</span>
            <Badge variant="blue" withDot={false} className="text-[10px] uppercase py-0 px-1">
              {currentRole}
            </Badge>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-dropdown py-1 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Interactive Role
              </div>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    loginAsRole(r.id);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                    currentRole === r.id ? 'bg-brand-50/50 text-brand-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span>{r.label}</span>
                  {currentRole === r.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
