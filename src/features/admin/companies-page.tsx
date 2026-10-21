import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Truck, Users, ShieldCheck, MapPin } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SearchFilterBar } from '../../components/ui/search-filter-bar';
import { mockStore } from '../../services/mock/mock-store';
import { Organization } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>(mockStore.getState().organizations);
  const [search, setSearch] = useState('');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setOrgs(mockStore.getState().organizations);
    });
  }, []);

  const filtered = orgs.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.industry.toLowerCase().includes(search.toLowerCase()) ||
    o.hqLocation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Registered Transport Organizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operational legal entities, industry segments, fleet allocations, and account managers.
          </p>
        </div>
      </div>

      <SearchFilterBar
        value={search}
        onChange={setSearch}
        placeholder="Filter by organization name, industry, or headquarters..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(org => (
          <Card key={org.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">{org.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{org.id}</span>
                  </div>
                </div>
                <Badge variant={org.contractStatus === 'active' ? 'safe' : 'warning'}>
                  {org.contractStatus.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="text-[11px] text-slate-500">{org.industry}</div>

                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{org.hqLocation}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center font-mono">
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-400 text-[10px] uppercase font-sans">Fleet</div>
                    <div className="font-bold text-slate-800 text-sm">{org.fleetSize}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-400 text-[10px] uppercase font-sans">Drivers</div>
                    <div className="font-bold text-slate-800 text-sm">{org.driverCount}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-400 text-[10px] uppercase font-sans">Devices</div>
                    <div className="font-bold text-emerald-700 text-sm">{org.activeDevicesCount}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Manager: <strong className="text-slate-700">{org.accountManager}</strong></span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(ROUTES.ADMIN.CUSTOMER_DETAIL(org.customerId))}
                className="h-7 text-xs"
              >
                View Account
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
