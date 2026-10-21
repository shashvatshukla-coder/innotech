import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserX, ExternalLink, ArrowUpDown } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SearchFilterBar } from '../../components/ui/search-filter-bar';
import { Pagination } from '../../components/ui/pagination';
import { Modal } from '../../components/ui/modal';
import { CustomerFormModal } from './customer-form-modal';
import { mockStore } from '../../services/mock/mock-store';
import { apiClient } from '../../services/api/client';
import { Customer, CustomerStatus, AccountType } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>(mockStore.getState().customers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Sorting
  const [sortField, setSortField] = useState<keyof Customer>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [customerToDeactivate, setCustomerToDeactivate] = useState<Customer | null>(null);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setCustomers(mockStore.getState().customers);
    });
  }, []);

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filtered = useMemo(() => {
    return customers.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.accountType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.companyName.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [customers, search, statusFilter, typeFilter, sortField, sortOrder]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleDeactivate = async () => {
    if (!customerToDeactivate) return;
    await apiClient.deactivateCustomer(customerToDeactivate.id);
    setCustomerToDeactivate(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Enterprise Client Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Commercial logistics companies registered on SafeDrive AI SaaS platform.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsAddOpen(true)} className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </Button>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <SearchFilterBar
            value={search}
            onChange={val => { setSearch(val); setPage(1); }}
            placeholder="Search by client ID, name, email, or contact..."
          >
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="past_due">Past Due</option>
              <option value="deactivated">Deactivated</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Tiers</option>
              <option value="enterprise">Enterprise</option>
              <option value="growth">Growth</option>
              <option value="starter">Starter</option>
            </select>
          </SearchFilterBar>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 select-none">
                <th className="py-2.5 px-3 font-semibold cursor-pointer" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold cursor-pointer" onClick={() => handleSort('companyName')}>
                  <div className="flex items-center gap-1">
                    <span>Company Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">Contact Person</th>
                <th className="py-2.5 px-3 font-semibold">Contact Info</th>
                <th className="py-2.5 px-3 font-semibold">Tier</th>
                <th className="py-2.5 px-3 font-semibold text-right cursor-pointer" onClick={() => handleSort('registeredVehicles')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Vehicles</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">Plan</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold cursor-pointer" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    <span>Created</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No customers match the current search or filters.
                  </td>
                </tr>
              ) : (
                paginated.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-brand-700">{cust.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{cust.companyName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{cust.contactPerson}</td>
                    <td className="py-2.5 px-3">
                      <div className="text-[11px] text-slate-800">{cust.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{cust.phone}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 text-[11px]">
                        {cust.accountType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                      {cust.registeredVehicles}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="capitalize text-slate-700 text-[11px]">
                        {cust.plan.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={cust.status === 'active' ? 'safe' : cust.status === 'trial' ? 'warning' : 'critical'}>
                        {cust.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {formatDate(cust.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(ROUTES.ADMIN.CUSTOMER_DETAIL(cust.id))}
                          className="h-7 px-2 text-slate-600 hover:text-brand-600"
                          title="View Customer Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>

                        {cust.status !== 'deactivated' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCustomerToDeactivate(cust)}
                            className="h-7 px-2 text-slate-400 hover:text-rose-600"
                            title="Deactivate Account"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
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

      {/* Add Customer Modal */}
      <CustomerFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={async dto => {
          await apiClient.createCustomer(dto);
        }}
      />

      {/* Confirmation Modal for Deactivate */}
      <Modal
        isOpen={!!customerToDeactivate}
        onClose={() => setCustomerToDeactivate(null)}
        title="Confirm Account Deactivation"
        description="Are you sure you want to deactivate this fleet customer account?"
        footer={
          <>
            <Button variant="outline" onClick={() => setCustomerToDeactivate(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeactivate}>
              Deactivate Account
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          Deactivating <strong className="text-slate-900">{customerToDeactivate?.companyName}</strong> will suspend active edge device sync licenses, flag associated subscription as cancelled, and place fleet monitoring in read-only audit mode.
        </p>
      </Modal>
    </div>
  );
};
