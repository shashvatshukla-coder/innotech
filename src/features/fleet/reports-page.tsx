import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3, Truck, Users, Wifi } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs } from '../../components/ui/tabs';
import { mockStore } from '../../services/mock/mock-store';
import { exportToCSV } from '../../utils/csv-export';
import { formatDateTime, formatDate, formatCategoryName } from '../../utils/formatters';

export const ReportsPage: React.FC = () => {
  const [state, setState] = useState(mockStore.getState());
  const [activeTab, setActiveTab] = useState<'incidents' | 'drivers' | 'vehicles' | 'sync'>('incidents');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setState(mockStore.getState());
    });
  }, []);

  const filteredIncidents = useMemo(() => {
    return state.incidents.filter(inc => {
      const date = inc.timestamp.split('T')[0];
      return date >= startDate && date <= endDate;
    });
  }, [state.incidents, startDate, endDate]);

  const handleExport = () => {
    if (activeTab === 'incidents') {
      exportToCSV(`safedrive_incidents_report_${startDate}_${endDate}`, filteredIncidents, [
        { header: 'Incident ID', accessor: i => i.id },
        { header: 'Timestamp', accessor: i => i.timestamp },
        { header: 'Driver Name', accessor: i => i.driverName },
        { header: 'Vehicle Plate', accessor: i => i.vehicleReg },
        { header: 'Category', accessor: i => i.category },
        { header: 'Severity', accessor: i => i.severity },
        { header: 'Duration (s)', accessor: i => i.durationSeconds },
        { header: 'Confidence', accessor: i => i.confidence !== undefined ? `${Math.round(i.confidence * 100)}%` : 'N/A' },
        { header: 'Review Status', accessor: i => i.reviewStatus },
        { header: 'Reviewer', accessor: i => i.reviewedBy || '' },
        { header: 'Review Notes', accessor: i => i.reviewNotes || '' },
      ]);
    } else if (activeTab === 'drivers') {
      exportToCSV(`safedrive_driver_safety_summary_${startDate}_${endDate}`, state.drivers, [
        { header: 'Driver ID', accessor: d => d.id },
        { header: 'Full Name', accessor: d => d.fullName },
        { header: 'License Number', accessor: d => d.licenseNumber },
        { header: 'Assigned Vehicle', accessor: d => d.assignedVehicleReg || 'Unassigned' },
        { header: 'Monitored Sessions', accessor: d => d.totalSessionsCount },
        { header: 'Monitored Hours', accessor: d => d.totalMonitoredHours },
        { header: 'Warning Alerts', accessor: d => d.warningEventsCount },
        { header: 'Critical Incidents', accessor: d => d.criticalIncidentsCount },
        { header: 'Duty Status', accessor: d => d.currentStatus },
      ]);
    } else if (activeTab === 'vehicles') {
      exportToCSV(`safedrive_vehicle_safety_summary_${startDate}_${endDate}`, state.vehicles, [
        { header: 'Vehicle ID', accessor: v => v.id },
        { header: 'Registration Plate', accessor: v => v.registrationNumber },
        { header: 'Make & Model', accessor: v => v.makeModel },
        { header: 'Type', accessor: v => v.vehicleType },
        { header: 'Assigned Driver', accessor: v => v.assignedDriverName || 'Unassigned' },
        { header: 'Edge Device', accessor: v => v.deviceId || 'None' },
        { header: 'Device Connection', accessor: v => v.deviceStatus },
        { header: 'Total Incidents', accessor: v => v.totalIncidentsCount },
        { header: 'Operational Status', accessor: v => v.status },
        { header: 'Depot Location', accessor: v => v.depotLocation },
      ]);
    } else {
      exportToCSV(`safedrive_sync_jobs_audit_${startDate}_${endDate}`, state.syncJobs, [
        { header: 'Job ID', accessor: j => j.id },
        { header: 'Device ID', accessor: j => j.deviceId },
        { header: 'Vehicle Plate', accessor: j => j.vehicleReg },
        { header: 'Type', accessor: j => j.type },
        { header: 'Status', accessor: j => j.status },
        { header: 'Queued At', accessor: j => j.queuedAt },
        { header: 'Synced At', accessor: j => j.syncedAt || '' },
        { header: 'Total Bytes', accessor: j => j.bytesTotal },
        { header: 'Transferred Bytes', accessor: j => j.bytesTransferred },
        { header: 'Retry Count', accessor: j => j.retryCount },
        { header: 'Error', accessor: j => j.error || '' },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Fleet Safety Reports & Compliance Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Export structured compliance logs for insurance underwriting, transport authorities, and depot safety audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="text-xs text-slate-700 focus:outline-none"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="text-xs text-slate-700 focus:outline-none"
            />
          </div>

          <Button variant="primary" size="sm" onClick={handleExport} className="gap-1.5 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV ({activeTab.toUpperCase()})</span>
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'incidents', label: 'Fleet Incident Log', count: filteredIncidents.length },
          { id: 'drivers', label: 'Driver Safety Summary', count: state.drivers.length },
          { id: 'vehicles', label: 'Vehicle Safety Summary', count: state.vehicles.length },
          { id: 'sync', label: 'Edge Sync & Video Queue', count: state.syncJobs.length },
        ]}
        activeTab={activeTab}
        onChange={t => setActiveTab(t as any)}
      />

      {activeTab === 'incidents' && (
        <Card padding="none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Showing <strong className="text-slate-900">{filteredIncidents.length}</strong> incidents between {startDate} and {endDate}
            </div>
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
                  <th className="py-2.5 px-3 font-semibold text-right">Duration</th>
                  <th className="py-2.5 px-3 font-semibold">Review Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-medium text-brand-700">{inc.id}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{formatDateTime(inc.timestamp)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{inc.driverName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{inc.vehicleReg}</td>
                    <td className="py-2.5 px-3">{formatCategoryName(inc.category)}</td>
                    <td className="py-2.5 px-3 font-semibold capitalize">
                      <span className={inc.severity === 'critical' ? 'text-rose-700' : 'text-amber-700'}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{inc.durationSeconds}s</td>
                    <td className="py-2.5 px-3 capitalize">{inc.reviewStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'drivers' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">Driver ID</th>
                  <th className="py-2.5 px-3 font-semibold">Driver Name</th>
                  <th className="py-2.5 px-3 font-semibold">License #</th>
                  <th className="py-2.5 px-3 font-semibold">Assigned Vehicle</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Sessions</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Hours</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Warnings</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Criticals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {state.drivers.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-medium text-brand-700">{d.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{d.fullName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{d.licenseNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{d.assignedVehicleReg || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{d.totalSessionsCount}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{d.totalMonitoredHours}h</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-700 font-bold">{d.warningEventsCount}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700 font-bold">{d.criticalIncidentsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'vehicles' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">Registration #</th>
                  <th className="py-2.5 px-3 font-semibold">Model</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Driver</th>
                  <th className="py-2.5 px-3 font-semibold">Device</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Violations</th>
                  <th className="py-2.5 px-3 font-semibold">Depot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {state.vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{v.registrationNumber}</td>
                    <td className="py-2.5 px-3 text-slate-700">{v.makeModel}</td>
                    <td className="py-2.5 px-3 text-slate-600">{v.vehicleType}</td>
                    <td className="py-2.5 px-3 text-slate-800">{v.assignedDriverName || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{v.deviceId || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{v.totalIncidentsCount}</td>
                    <td className="py-2.5 px-3 text-slate-600">{v.depotLocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'sync' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">Sync Job ID</th>
                  <th className="py-2.5 px-3 font-semibold">Device Serial</th>
                  <th className="py-2.5 px-3 font-semibold">Vehicle</th>
                  <th className="py-2.5 px-3 font-semibold">Payload Type</th>
                  <th className="py-2.5 px-3 font-semibold">Queued At</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {state.syncJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-medium text-brand-700">{job.id}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{job.deviceId}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">{job.vehicleReg}</td>
                    <td className="py-2.5 px-3 text-slate-600">{job.type.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{formatDateTime(job.queuedAt)}</td>
                    <td className="py-2.5 px-3 capitalize">
                      <span className={job.status === 'completed' ? 'text-emerald-700 font-semibold' : job.status === 'failed' ? 'text-rose-700 font-semibold' : 'text-blue-700'}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {Math.round((job.bytesTransferred / (job.bytesTotal || 1)) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
