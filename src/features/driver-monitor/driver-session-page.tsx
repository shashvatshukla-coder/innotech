import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, AlertTriangle, Truck, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../constants/routes';

export const DriverSessionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.DRIVER.MONITOR)} className="h-8 px-2.5">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Driver HUD</span>
          </Button>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Commercial Driving Shift Summary
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Current Shift Duration
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">4h 07m</div>
          <p className="text-[11px] text-slate-500 mt-1">Pune to Kolhapur corridor</p>
        </Card>

        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Voice Warnings Heard
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">1</div>
          <p className="text-[11px] text-slate-500 mt-1">Mobile phone glance at toll plaza</p>
        </Card>

        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Mandatory Rest Breaks
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">1 Logged</div>
          <p className="text-[11px] text-slate-500 mt-1">Satara Bypass Food Plaza (30m)</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Trip Handover Details</CardTitle>
            <CardDescription>Shift details verified by onboard SafeDrive edge unit</CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Vehicle Registration:</span>
            <span className="font-mono font-bold text-slate-900">MH-12-RN-4821</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Chassis Make:</span>
            <span>Tata Prima 5530.S (Heavy Truck 16-Wheel)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Driver License:</span>
            <span className="font-mono text-slate-900">MH-1420150029381</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Edge Device Serial:</span>
            <span className="font-mono text-brand-700">DEV-IND-091</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Cloud Sync Status:</span>
            <span className="text-emerald-700 font-semibold">100% Synced to Bharat Logistics Depot</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.DRIVER.MONITOR)}>
            Return to Active Driving HUD
          </Button>
        </div>
      </Card>
    </div>
  );
};
