import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Cpu, User, Wifi, Clock, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockStore } from '../../services/mock/mock-store';
import { Vehicle } from '../../types';
import { formatDateTime, formatCategoryName } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const v = mockStore.getState().vehicles.find(veh => veh.id === id || veh.registrationNumber === id);
    if (v) setVehicle(v);
  }, [id]);

  if (!vehicle) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-800">Vehicle Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No commercial vehicle matches the provided registration.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.VEHICLES)} className="mt-4">
          Back to Vehicles Directory
        </Button>
      </div>
    );
  }

  const driver = mockStore.getState().drivers.find(d => d.id === vehicle.assignedDriverId);
  const device = mockStore.getState().devices.find(dev => dev.id === vehicle.deviceId);
  const incidents = mockStore.getState().incidents.filter(inc => inc.vehicleId === vehicle.id || inc.vehicleReg === vehicle.registrationNumber);
  const sessions = mockStore.getState().sessions.filter(s => s.vehicleId === vehicle.id || s.vehicleReg === vehicle.registrationNumber);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Registration Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.VEHICLES)} className="h-8 px-2.5">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Vehicles</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold font-mono text-slate-900 tracking-tight flex items-center gap-2">
              <span>{vehicle.registrationNumber}</span>
              <span className="text-xs font-sans font-medium text-slate-500">({vehicle.makeModel})</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={vehicle.deviceStatus === 'online' ? 'safe' : vehicle.deviceStatus === 'intermittent' ? 'warning' : 'offline'}>
            Edge: {vehicle.deviceStatus}
          </Badge>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 font-medium text-slate-700 capitalize border border-slate-200">
            {vehicle.status}
          </span>
        </div>
      </div>

      {/* Grid of Profile & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vehicle Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Chassis & Depot</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Type:</span>
              <span className="font-semibold text-slate-800">{vehicle.vehicleType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Model Year:</span>
              <span className="font-mono text-slate-800">{vehicle.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Depot Hub:</span>
              <span className="text-slate-800">{vehicle.depotLocation}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500">Last Telemetry Sync:</span>
              <span className="font-mono text-slate-700">{formatDateTime(vehicle.lastSyncAt)}</span>
            </div>
          </div>
        </Card>

        {/* Assigned Driver */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Assigned Driver</CardTitle>
          </CardHeader>
          {driver ? (
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-sm text-slate-900">{driver.fullName}</div>
              <div className="text-slate-500 font-mono">License: {driver.licenseNumber}</div>
              <div className="text-slate-500 font-mono">Mobile: {driver.phone}</div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Duty Status:</span>
                <span className="capitalize font-medium text-emerald-700">{driver.currentStatus}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-4 text-center">
              No driver currently assigned to this vehicle chassis.
            </div>
          )}
        </Card>

        {/* Connected Edge Unit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Onboard Edge Unit Health</CardTitle>
          </CardHeader>
          {device ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Device Serial:</span>
                <span className="font-semibold text-brand-700">{device.id}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Firmware:</span>
                <span className="text-slate-800">{device.firmwareVersion}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Inference Latency:</span>
                <span className="text-slate-800">{device.health.lastInferenceMs} ms</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Camera State:</span>
                <span className="capitalize font-medium text-emerald-700">{device.cameraState}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Unsynced Queue:</span>
                <span className="font-semibold text-slate-800">{device.health.queueDepth} buffered events</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-4 text-center">
              No SafeDrive hardware device paired.
            </div>
          )}
        </Card>
      </div>

      {/* Incident History on this Vehicle */}
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Violation & Safety Incident History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Events detected onboard vehicle {vehicle.registrationNumber}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Incident #</th>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Driver</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Severity</th>
                <th className="py-2.5 px-3 font-semibold">Detection Source</th>
                <th className="py-2.5 px-3 font-semibold">Review</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No safety incidents logged for this vehicle registration.
                  </td>
                </tr>
              ) : (
                incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-mono font-medium text-brand-700">{inc.id}</td>
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{formatDateTime(inc.timestamp)}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{inc.driverName}</td>
                    <td className="py-2 px-3">{formatCategoryName(inc.category)}</td>
                    <td className="py-2 px-3">
                      <Badge variant={inc.severity === 'critical' ? 'critical' : inc.severity === 'warning' ? 'warning' : 'safe'}>
                        {inc.severity}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{inc.detectionSource}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
