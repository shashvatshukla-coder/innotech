import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Shield, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { mockStore } from '../../services/mock/mock-store';
import { Subscription } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

export const SalesPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockStore.getState().subscriptions);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setSubscriptions(mockStore.getState().subscriptions);
    });
  }, []);

  const PLANS = [
    {
      id: 'starter_fleet',
      name: 'Starter Fleet',
      priceINR: 45000,
      billing: 'Per month (up to 5 vehicles)',
      features: [
        'Prolonged Eye Closure (MediaPipe)',
        'Basic Hindi audio announcements',
        'Standard 7-day cloud incident log',
        'Fleet overview dashboard',
        'Business hours email support',
      ],
    },
    {
      id: 'professional_safety',
      name: 'Professional Safety',
      priceINR: 125000,
      billing: 'Per month (up to 15 vehicles)',
      popular: true,
      features: [
        'Everything in Starter Fleet',
        'YOLOv8 Mobile Phone Detection',
        'Head Pose Distraction Analytics',
        '10-second MP4 Video Evidence sync',
        'Safety Reviewer audit sign-offs',
        'CSV export & compliance summaries',
      ],
    },
    {
      id: 'enterprise_ai',
      name: 'Enterprise AI & Edge Lab',
      priceINR: 240000,
      billing: 'Per month (up to 30 vehicles)',
      features: [
        'Everything in Professional',
        'Real-time edge telemetry bridge',
        'Hardware diagnostics & testing lab',
        'Configurable AI inference thresholds',
        'Dedicated 24/7 technical lead & SLA',
        'Custom depot multi-tenant policies',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Commercial Plans & Active Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fleet monitoring tier catalog, recurring billing schedules, and licensed client deployments.
          </p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map(plan => (
          <Card key={plan.id} className={`flex flex-col justify-between ${plan.popular ? 'border-brand-500 ring-1 ring-brand-500 shadow-md' : ''}`}>
            <div>
              {plan.popular && (
                <div className="inline-block px-2.5 py-0.5 bg-brand-600 text-white text-[10px] font-semibold uppercase tracking-wider rounded mb-3">
                  Most Deployed
                </div>
              )}
              <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{plan.billing}</p>

              <div className="mt-4 pb-4 border-b border-slate-100">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {formatINR(plan.priceINR)}
                </span>
                <span className="text-xs text-slate-500 font-sans"> / month</span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Included Capabilities
                </div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Active deployments:{' '}
                <strong className="text-slate-800 font-mono">
                  {subscriptions.filter(s => s.plan === plan.id).length}
                </strong>
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Subscriptions Table */}
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Active Fleet Client Subscriptions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Recurring billing schedules and contract renewal dates.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Subscription ID</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold">Plan</th>
                <th className="py-2.5 px-3 font-semibold">Billing</th>
                <th className="py-2.5 px-3 font-semibold text-right">Licensed Vehicles</th>
                <th className="py-2.5 px-3 font-semibold text-right">Amount (INR)</th>
                <th className="py-2.5 px-3 font-semibold">Renewal Date</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono font-medium text-brand-700">{sub.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{sub.customerName}</td>
                  <td className="py-2.5 px-3 capitalize">{sub.plan.replace(/_/g, ' ')}</td>
                  <td className="py-2.5 px-3 capitalize text-slate-500">{sub.billingCycle}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <span className="font-semibold text-slate-900">{sub.activeVehicles}</span>
                    <span className="text-slate-400"> / {sub.maxVehicles}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(sub.amountINR)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{formatDate(sub.renewalDate)}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={sub.status === 'active' ? 'safe' : sub.status === 'trial' ? 'warning' : 'critical'}>
                      {sub.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
