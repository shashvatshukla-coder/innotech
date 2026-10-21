import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Wifi, WifiOff, Camera, AlertCircle, Play, ExternalLink, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SearchFilterBar } from '../../components/ui/search-filter-bar';
import { mockStore } from '../../services/mock/mock-store';
import { MonitoringDevice } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const DeviceLabPage: React.FC = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<MonitoringDevice[]>(mockStore.getState().devices);
  const [search, setSearch] = useState('');
  const [connFilter, setConnFilter] = useState<string>('all');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setDevices(mockStore.getState().devices);
    });
  }, []);

  const filtered = devices.filter(d => {
    if (connFilter !== 'all' && d.connectionState !== connFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        (d.assignedVehicleReg && d.assignedVehicleReg.toLowerCase().includes(q)) ||
        d.firmwareVersion.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI Testing Lab & Edge Hardware Fleet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Diagnostics for onboard ARM64 units running YOLOv8 phone detection, MediaPipe EAR, and Hindi voice synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.LAB.EVENTS)}
            className="gap-1.5 h-8"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Detection Event Timeline</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.LAB.DEVICE_DETAIL('DEV-LAB-TESTER'))}
            className="gap-1.5 h-8 shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch Live Test Bench</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Active Hardware Units
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {devices.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {devices.filter(d => d.connectionState === 'online').length} streaming heartbeats over LTE/Wi-Fi
          </p>
        </Card>

        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            AI Models Loaded
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {devices.filter(d => d.health.yoloModelLoaded && d.health.mediaPipeLoaded).length} / {devices.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            YOLOv8n (`yolov8n.pt`) and MediaPipe Face Mesh initialized
          </p>
        </Card>

        <Card>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Unsynced Buffered Events
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {devices.reduce((acc, d) => acc + d.health.queueDepth, 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Clips buffered in local flash storage awaiting bandwidth handshake
          </p>
        </Card>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <SearchFilterBar
            value={search}
            onChange={setSearch}
            placeholder="Search by device ID, vehicle, or firmware version..."
          >
            <select
              value={connFilter}
              onChange={e => setConnFilter(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Connection States</option>
              <option value="online">Online</option>
              <option value="intermittent">Intermittent</option>
              <option value="offline">Offline</option>
            </select>
          </SearchFilterBar>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Device Serial</th>
                <th className="py-2.5 px-3 font-semibold">Device Name</th>
                <th className="py-2.5 px-3 font-semibold">Assigned Vehicle</th>
                <th className="py-2.5 px-3 font-semibold">Camera Sensor</th>
                <th className="py-2.5 px-3 font-semibold">AI Runtime</th>
                <th className="py-2.5 px-3 font-semibold text-right">Inference</th>
                <th className="py-2.5 px-3 font-semibold text-right">CPU / RAM</th>
                <th className="py-2.5 px-3 font-semibold">Connectivity</th>
                <th className="py-2.5 px-3 font-semibold">Last Heartbeat</th>
                <th className="py-2.5 px-3 font-semibold text-right">Workbench</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(dev => (
                <tr key={dev.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono font-medium text-brand-700">{dev.id}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {dev.name}
                    {dev.isSimulated && (
                      <span className="ml-1.5 px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] rounded font-mono">
                        Sim Bench
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800">
                    {dev.assignedVehicleReg || <span className="text-slate-400 italic">Bench Standalone</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="capitalize text-slate-700">{dev.cameraState}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="capitalize text-slate-700 font-medium">{dev.aiModelState}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {dev.health.lastInferenceMs > 0 ? `${dev.health.lastInferenceMs}ms` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {dev.health.cpuUsagePercent}% / {dev.health.memoryUsagePercent}%
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={dev.connectionState === 'online' ? 'safe' : dev.connectionState === 'intermittent' ? 'warning' : 'offline'}>
                      {dev.connectionState}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {formatDateTime(dev.lastHeartbeatAt)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(ROUTES.LAB.DEVICE_DETAIL(dev.id))}
                      className="h-7 px-2 text-xs gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Diagnostics</span>
                    </Button>
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
