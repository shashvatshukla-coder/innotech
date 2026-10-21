import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Truck, ExternalLink, ArrowUpDown, Wifi, WifiOff } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SearchFilterBar } from '../../components/ui/search-filter-bar';
import { Pagination } from '../../components/ui/pagination';
import { VehicleFormModal } from './vehicle-form-modal';
import { mockStore } from '../../services/mock/mock-store';
import { apiClient } from '../../services/api/client';
import { Vehicle } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockStore.getState().vehicles);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    return mockStore.subscribe(() => {
      setVehicles(mockStore.getState().vehicles);
    });
  }, []);

  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (deviceFilter !== 'all' && v.deviceStatus !== deviceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          v.registrationNumber.toLowerCase().includes(q) ||
          v.makeModel.toLowerCase().includes(q) ||
          (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(q)) ||
          (v.deviceId && v.deviceId.toLowerCase().includes(q)) ||
          v.depotLocation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vehicles, search, statusFilter, deviceFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Commercial Fleet Vehicles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registered commercial haulers, assigned drivers, connected SafeDrive edge units, and synchronization freshness.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsAddOpen(true)} className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </Button>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <SearchFilterBar
            value={search}
            onChange={val => { setSearch(val); setPage(1); }}
            placeholder="Search by registration plate, driver, device serial, or depot..."
          >
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Operational Statuses</option>
              <option value="active">Active On Route</option>
              <option value="maintenance">Maintenance</option>
              <option value="idle">Idle in Depot</option>
            </select>

            <select
              value={deviceFilter}
              onChange={e => { setDeviceFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Device States</option>
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
                <th className="py-2.5 px-3 font-semibold">Registration #</th>
                <th className="py-2.5 px-3 font-semibold">Make & Model</th>
                <th className="py-2.5 px-3 font-semibold">Vehicle Type</th>
                <th className="py-2.5 px-3 font-semibold">Assigned Driver</th>
                <th className="py-2.5 px-3 font-semibold">Edge Device</th>
                <th className="py-2.5 px-3 font-semibold">Device Link</th>
                <th className="py-2.5 px-3 font-semibold text-right">Violations</th>
                <th className="py-2.5 px-3 font-semibold">Vehicle State</th>
                <th className="py-2.5 px-3 font-semibold">Last Freshness</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No vehicles match the selected search or filters.
                  </td>
                </tr>
              ) : (
                paginated.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tracking-tight">
                      {v.registrationNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{v.makeModel}</td>
                    <td className="py-2.5 px-3 text-slate-600">{v.vehicleType}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {v.assignedDriverName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {v.deviceId || <span className="text-slate-400 italic">No Device</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={v.deviceStatus === 'online' ? 'safe' : v.deviceStatus === 'intermittent' ? 'warning' : 'offline'}>
                        {v.deviceStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                      {v.totalIncidentsCount}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="capitalize px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(v.lastSyncAt)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(ROUTES.OWNER.VEHICLE_DETAIL(v.id))}
                        className="h-7 px-2 text-slate-600 hover:text-brand-600"
                        title="View Vehicle Telemetry & History"
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

        <Pagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </Card>

      <VehicleFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={async dto => {
          await apiClient.registerVehicle(dto);
        }}
      />
    </div>
  );
};
