import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../constants/routes';

export const UnauthorizedPage: React.FC<{ requiredRoles?: string[] }> = ({ requiredRoles }) => {
  const navigate = useNavigate();
  const { currentRole, loginAsRole } = useAuth();

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4 border border-rose-200">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
      <p className="text-sm text-slate-600 max-w-md mt-2">
        Your current role (<span className="font-semibold font-mono text-slate-800">{currentRole}</span>) does not have authorization to view this enterprise portal section.
      </p>
      {requiredRoles && requiredRoles.length > 0 && (
        <p className="text-xs text-slate-500 mt-1">
          Required roles: {requiredRoles.join(', ')}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </Button>

        <Button variant="primary" onClick={() => loginAsRole('owner')} className="gap-2">
          <span>Switch to Fleet Owner Role</span>
        </Button>

        <Button variant="secondary" onClick={() => navigate(ROUTES.PUBLIC.LOGIN)} className="gap-2">
          <LogIn className="w-4 h-4" />
          <span>Change Account</span>
        </Button>
      </div>
    </div>
  );
};
