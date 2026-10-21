import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from './auth-context';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { ROUTES } from '../../constants/routes';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [email, setEmail] = useState('rajesh@bharatlogistics.in');
  const [password, setPassword] = useState('••••••••••••');

  const ROLE_CONFIGS: { role: UserRole; title: string; email: string; target: string; desc: string }[] = [
    {
      role: 'owner',
      title: 'Fleet Owner',
      email: 'rajesh@bharatlogistics.in',
      target: ROUTES.OWNER.OVERVIEW,
      desc: 'Fleet overview, incidents review, vehicle tracking & reports',
    },
    {
      role: 'admin',
      title: 'Platform Administrator',
      email: 'vikram.sharma@safedrive.ai',
      target: ROUTES.ADMIN.OVERVIEW,
      desc: 'SaaS customer directory, subscriptions, MRR & invoices',
    },
    {
      role: 'reviewer',
      title: 'Safety Reviewer',
      email: 'sunil.safety@bharatlogistics.in',
      target: ROUTES.OWNER.INCIDENTS,
      desc: 'Violation triage, video evidence player, audit sign-off',
    },
    {
      role: 'tester',
      title: 'Device & AI Tester',
      email: 'kavita.nair@safedrive.ai',
      target: ROUTES.LAB.DEVICES,
      desc: 'Hardware diagnostics, YOLOv8/MediaPipe testing, sync pipeline',
    },
    {
      role: 'driver',
      title: 'Commercial Driver',
      email: 'rameshwar.driver@bharatlogistics.in',
      target: ROUTES.DRIVER.MONITOR,
      desc: 'In-cab live safety HUD, audio warnings, glanceable status',
    },
  ];

  const handleSelectRole = (r: typeof ROLE_CONFIGS[0]) => {
    setSelectedRole(r.role);
    setEmail(r.email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsRole(selectedRole);
    const target = ROLE_CONFIGS.find(r => r.role === selectedRole)?.target || ROUTES.OWNER.OVERVIEW;
    navigate(target);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background subtle mesh grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-md bg-brand-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SafeDrive AI</span>
        </div>
        <h2 className="text-center text-lg font-medium text-slate-300">
          Enterprise Fleet Safety & Driver Monitoring Platform
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Disciplined telemetry, edge computer vision and operational fleet compliance
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md p-6 text-slate-200">
          <div className="mb-5 pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Interactive Role Persona
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-brand-950 text-brand-300 border border-brand-800 rounded">
                Demo Auth Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {ROLE_CONFIGS.map(item => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleSelectRole(item)}
                  className={`flex flex-col text-left p-2.5 rounded-md border transition-all text-xs ${
                    selectedRole === item.role
                      ? 'border-brand-500 bg-brand-950/60 text-white ring-1 ring-brand-500'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{item.title}</span>
                    {selectedRole === item.role && <UserCheck className="w-3.5 h-3.5 text-brand-400" />}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Work Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full gap-2 mt-2 bg-brand-600 hover:bg-brand-500"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In as {ROLE_CONFIGS.find(r => r.role === selectedRole)?.title}</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Client Tenant: Bharat Logistics Ltd</span>
            <span>Edge Protocol: v2.4 TLS</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
