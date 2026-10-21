import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Shield, Clock, AlertTriangle, Truck, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockStore } from '../../services/mock/mock-store';
import { Driver } from '../../types';
import { formatDateTime, formatCategoryName } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const DriverDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const d = mockStore.getState().drivers.find(drv => drv.id === id);
    if (d) setDriver(d);
  }, [id]);

  if (!driver) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-800">Driver Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No driver profile exists with the specified ID.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.DRIVERS)} className="mt-4">
          Back to Driver Directory
        </Button>
      </div>
    );
  }

  const incidents = mockStore.getState().incidents.filter(inc => inc.driverId === driver.id);
  const reviewedIncidents = incidents.filter(inc => inc.reviewStatus === 'reviewed');
  const pendingIncidents = incidents.filter(inc => inc.reviewStatus !== 'reviewed');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.DRIVERS)} className="h-8 px-2.5">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Drivers</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{driver.fullName}</span>
              <span className="text-xs font-mono font-medium text-brand-700">({driver.id})</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={driver.currentStatus === 'active' ? 'safe' : driver.currentStatus === 'idle' ? 'warning' : 'offline'}>
            Status: {driver.currentStatus}
          </Badge>
        </div>
      </div>

      {/* Profile & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Driver Credentials</div>
          <div className="space-y-1.5 text-xs">
            <div className="font-semibold text-slate-900 text-sm">{driver.fullName}</div>
            <div className="text-slate-600 font-mono">License: {driver.licenseNumber}</div>
            <div className="text-slate-600 font-mono">Mobile: {driver.phone}</div>
            <div className="text-slate-500 text-[11px] pt-1">
              Joined Fleet: {driver.joinedDate}
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Assigned Hauler</div>
          <div className="space-y-1.5 text-xs">
            <div className="font-mono font-bold text-slate-900 text-sm">
              {driver.assignedVehicleReg || 'Unassigned'}
            </div>
            <div className="text-slate-500">
              Chassis Ref: {driver.assignedVehicleId || 'None'}
            </div>
            {driver.assignedVehicleId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(ROUTES.OWNER.VEHICLE_DETAIL(driver.assignedVehicleId!))}
                className="h-6 text-[11px] mt-2 gap-1"
              >
                <span>Chassis Telemetry</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Telemetry Sessions</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {driver.totalSessionsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {driver.totalMonitoredHours} total hours logged with active MediaPipe EAR & YOLO vision
          </p>
        </Card>

        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Safety Record</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700">{driver.warningEventsCount}w</span>
            <span className="text-2xl font-bold font-mono text-rose-700">{driver.criticalIncidentsCount}c</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {reviewedIncidents.length} reviewed by safety officers
          </p>
        </Card>
      </div>

      {/* Emergency Contact Information */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Phone className="w-4 h-4 text-slate-500" />
          <div>
            <span className="font-semibold text-slate-800">In-Cab Emergency Contact:</span>{' '}
            <span className="text-slate-700">{driver.emergencyContact.name} ({driver.emergencyContact.relationship})</span>
            <span className="font-mono text-slate-600 ml-2">{driver.emergencyContact.phone}</span>
          </div>
        </div>
      </div>

      {/* Incidents & Violations Dossier */}
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Violation & Evidence Log for {driver.fullName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distinguishing raw detected alerts from audited and reviewed safety violations.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Incident #</th>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Vehicle</th>
                <th className="py-2.5 px-3 font-semibold">Violation Type</th>
                <th className="py-2.5 px-3 font-semibold">Severity</th>
                <th className="py-2.5 px-3 font-semibold text-right">Duration</th>
                <th className="py-2.5 px-3 font-semibold">Review Status</th>
                <th className="py-2.5 px-3 font-semibold">Safety Reviewer Notes</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No safety incidents logged for this driver. Clean driving record.
                  </td>
                </tr>
              ) : (
                incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-mono font-medium text-brand-700">{inc.id}</td>
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{formatDateTime(inc.timestamp)}</td>
                    <td className="py-2 px-3 font-mono text-slate-800">{inc.vehicleReg}</td>
                    <td className="py-2 px-3">{formatCategoryName(inc.category)}</td>
                    <td className="py-2 px-3">
                      <Badge variant={inc.severity === 'critical' ? 'critical' : inc.severity === 'warning' ? 'warning' : 'safe'}>
                        {inc.severity}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">{inc.durationSeconds}s</td>
                    <td className="py-2 px-3">
                      <Badge variant={inc.reviewStatus === 'reviewed' ? 'safe' : inc.reviewStatus === 'under_review' ? 'review' : 'neutral'}>
                        {inc.reviewStatus}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-600 max-w-xs truncate" title={inc.reviewNotes}>
                      {inc.reviewNotes || <span className="text-slate-400 italic">Pending review</span>}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
