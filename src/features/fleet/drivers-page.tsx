import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Truck, Phone, ExternalLink, ArrowUpDown } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SearchFilterBar } from '../../components/ui/search-filter-bar';
import { Pagination } from '../../components/ui/pagination';
import { mockStore } from '../../services/mock/mock-store';
import { Driver } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const DriversPage: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>(mockStore.getState().drivers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    return mockStore.subscribe(() => {
      setDrivers(mockStore.getState().drivers);
    });
  }, []);

  const filtered = useMemo(() => {
    return drivers.filter(d => {
      if (statusFilter !== 'all' && d.currentStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          d.fullName.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.licenseNumber.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          (d.assignedVehicleReg && d.assignedVehicleReg.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [drivers, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Commercial Driver Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Commercial heavy vehicle operators, assigned routes, monitored sessions, and safety alert histories.
          </p>
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <SearchFilterBar
            value={search}
            onChange={val => { setSearch(val); setPage(1); }}
            placeholder="Search by driver name, license, phone number, or vehicle..."
          >
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Duty Statuses</option>
              <option value="active">Active On Duty</option>
              <option value="idle">Idle / Break</option>
              <option value="off_duty">Off Duty</option>
            </select>
          </SearchFilterBar>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Driver ID</th>
                <th className="py-2.5 px-3 font-semibold">Full Name</th>
                <th className="py-2.5 px-3 font-semibold">License #</th>
                <th className="py-2.5 px-3 font-semibold">Contact</th>
                <th className="py-2.5 px-3 font-semibold">Assigned Vehicle</th>
                <th className="py-2.5 px-3 font-semibold text-right">Sessions</th>
                <th className="py-2.5 px-3 font-semibold text-right">Warnings</th>
                <th className="py-2.5 px-3 font-semibold text-right">Criticals</th>
                <th className="py-2.5 px-3 font-semibold">Duty Status</th>
                <th className="py-2.5 px-3 font-semibold">Last Active</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No drivers match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-brand-700">{d.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{d.fullName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{d.licenseNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{d.phone}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {d.assignedVehicleReg || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{d.totalSessionsCount}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-700">
                      {d.warningEventsCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      {d.criticalIncidentsCount}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={d.currentStatus === 'active' ? 'safe' : d.currentStatus === 'idle' ? 'warning' : 'offline'}>
                        {d.currentStatus.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(d.lastActiveAt)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(ROUTES.OWNER.DRIVER_DETAIL(d.id))}
                        className="h-7 px-2 text-slate-600 hover:text-brand-600"
                        title="View Driver Safety Dossier"
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
    </div>
  );
};
