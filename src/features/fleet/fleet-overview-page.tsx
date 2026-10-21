import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Users, 
  Wifi, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockStore } from '../../services/mock/mock-store';
import { 
  selectFleetOwnerMetrics, 
  selectIncidentTrends, 
  selectCategoryBreakdown, 
  selectTopDriversByIncidents 
} from '../../utils/selectors';
import { formatDateTime, formatCategoryName, formatSeverityName } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const FleetOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState(mockStore.getState());
  const [trendDays, setTrendDays] = useState<7 | 14 | 30>(7);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setState(mockStore.getState());
    });
  }, []);

  const metrics = selectFleetOwnerMetrics(
    state.vehicles,
    state.drivers,
    state.devices,
    state.incidents
  );

  const incidentTrends = selectIncidentTrends(state.incidents, trendDays);
  const categoryBreakdown = selectCategoryBreakdown(state.incidents);
  const topDrivers = selectTopDriversByIncidents(state.drivers, state.incidents);

  const CATEGORY_COLORS: Record<string, string> = {
    prolonged_eye_closure: '#dc2626',
    drowsiness: '#ef4444',
    phone_use: '#f59e0b',
    distracted_posture: '#3b82f6',
    sync_failure: '#64748b',
    driver_unresponsive: '#8b5cf6',
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Fleet Safety & Operational Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time driver fatigue, mobile phone violations, edge device connectivity, and safety compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.INCIDENTS)} className="gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Review Queue ({metrics.incidentsAwaitingReview})</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.OWNER.REPORTS)} className="gap-1.5 shadow-sm">
            <span>Safety Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fleet Deployment</span>
            <Truck className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.activeVehicles}
            </span>
            <span className="text-xs font-mono text-slate-500">/ {metrics.totalVehicles} Vehicles Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.driversAssigned} drivers assigned to active haul routes
          </p>
        </Card>

        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Online Edge Units</span>
            <Wifi className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {metrics.onlineMonitoringDevices}
            </span>
            <span className="text-xs font-mono text-slate-500">/ {metrics.totalDevices} Devices Connected</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.totalDevices - metrics.onlineMonitoringDevices} devices intermittent or depot maintenance
          </p>
        </Card>

        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Violations Today</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
              {metrics.criticalIncidentsToday}
            </span>
            <span className="text-xs text-rose-800 font-medium">Criticals</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Prolonged eye closure (&gt;10s) or critical distraction
          </p>
        </Card>

        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Warnings Today</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {metrics.warningsToday}
            </span>
            <span className="text-xs text-amber-800 font-medium">Warning Alerts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cab audio alerts played via Hindi speech synthesizer
          </p>
        </Card>
      </div>

      {/* Operational Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-mono font-bold text-sm">
              {metrics.fleetSafetyScore}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Fleet Safety Compliance Score
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Derived composite index based on critical violation density per operating vehicle
              </div>
            </div>
          </div>
          <Badge variant="safe">Standard Good</Badge>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-mono font-bold text-sm">
              {metrics.incidentsAwaitingReview}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Incident Review Queue
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Violation events requiring review note and reviewer audit sign-off
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.OWNER.INCIDENTS)}>
            Triage Now
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Daily Incident Frequency</CardTitle>
              <CardDescription>Warning alerts vs critical driver safety violations</CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-xs">
              {([7, 14, 30] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setTrendDays(d)}
                  className={`px-2 py-0.5 rounded font-medium ${
                    trendDays === d ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </CardHeader>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="warning" name="Warning Alerts" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="critical" name="Critical Events" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Violation Categories</CardTitle>
              <CardDescription>Breakdown by detection algorithm</CardDescription>
            </div>
          </CardHeader>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.category] || '#3b82f6'} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} Events`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-1 text-xs border-t border-slate-100 pt-2.5">
            {categoryBreakdown.map(item => (
              <div key={item.category} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#3b82f6' }}
                  />
                  <span className="truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="font-mono font-medium text-slate-800">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Section: Top Drivers & Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Drivers Requiring Coaching */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Drivers Requiring Safety Coaching</CardTitle>
              <CardDescription>Highest frequency of recorded alerts</CardDescription>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.OWNER.DRIVERS)} className="h-7 text-xs">
              All Drivers
            </Button>
          </CardHeader>

          <div className="space-y-3">
            {topDrivers.map((d, idx) => (
              <div
                key={d.driverId}
                onClick={() => navigate(ROUTES.OWNER.DRIVER_DETAIL(d.driverId))}
                className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-400 font-bold w-4">{idx + 1}</span>
                  <div>
                    <div className="font-semibold text-slate-900">{d.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{d.driverId}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {d.warning}w
                  </span>
                  <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    {d.critical}c
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Incidents Table */}
        <Card className="lg:col-span-2" padding="none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Recent Violations & System Events</h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological detection feed with evidence status.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.OWNER.INCIDENTS)}>
              View All Incidents
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">Incident #</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Driver</th>
                  <th className="py-2.5 px-3 font-semibold">Vehicle</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Severity</th>
                  <th className="py-2.5 px-3 font-semibold">Review</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {state.incidents.slice(0, 5).map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-mono font-medium text-brand-700">{inc.id}</td>
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{formatDateTime(inc.timestamp)}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{inc.driverName}</td>
                    <td className="py-2 px-3 font-mono text-slate-700">{inc.vehicleReg}</td>
                    <td className="py-2 px-3">{formatCategoryName(inc.category)}</td>
                    <td className="py-2 px-3">
                      <Badge variant={inc.severity === 'critical' ? 'critical' : inc.severity === 'warning' ? 'warning' : 'safe'}>
                        {inc.severity}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant={inc.reviewStatus === 'reviewed' ? 'safe' : inc.reviewStatus === 'under_review' ? 'review' : 'neutral'}>
                        {inc.reviewStatus}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(ROUTES.OWNER.INCIDENT_DETAIL(inc.id))}
                        className="h-7 px-2 text-slate-600 hover:text-brand-600"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
