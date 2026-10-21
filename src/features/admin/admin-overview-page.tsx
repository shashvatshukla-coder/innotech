import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Truck, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockStore } from '../../services/mock/mock-store';
import { selectAdminMetrics } from '../../utils/selectors';
import { formatINR, formatNumber, formatDate } from '../../utils/formatters';
import { CustomerFormModal } from './customer-form-modal';
import { apiClient } from '../../services/api/client';
import { CreateCustomerDTO } from '../../services/api/types';
import { ROUTES } from '../../constants/routes';

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState(mockStore.getState());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<'30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setState(mockStore.getState());
    });
  }, []);

  const metrics = selectAdminMetrics(
    state.customers,
    state.subscriptions,
    state.invoices,
    state.vehicles
  );

  const handleCreateCustomer = async (dto: CreateCustomerDTO) => {
    await apiClient.createCustomer(dto);
  };

  // Derived trend data for charts based on active state
  const mrrTrendData = [
    { month: 'Jun', mrr: 240000 },
    { month: 'Jul', mrr: 285000 },
    { month: 'Aug', mrr: 330000 },
    { month: 'Sep', mrr: 410000 },
    { month: 'Oct', mrr: metrics.monthlyRecurringRevenueINR },
  ];

  const acquisitionData = [
    { month: 'Jun', count: 1 },
    { month: 'Jul', count: 0 },
    { month: 'Aug', count: 1 },
    { month: 'Sep', count: 1 },
    { month: 'Oct', count: metrics.newCustomersThisMonth },
  ];

  const subscriptionDistribution = [
    { name: 'Enterprise AI', value: state.subscriptions.filter(s => s.plan === 'enterprise_ai').length, color: '#2563eb' },
    { name: 'Pro Safety', value: state.subscriptions.filter(s => s.plan === 'professional_safety').length, color: '#3b82f6' },
    { name: 'Starter Fleet', value: state.subscriptions.filter(s => s.plan === 'starter_fleet').length, color: '#93c5fd' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Platform Administration Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fleet SaaS commercial metrics, recurring revenue, enterprise customers, and licensing health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
            {(['30d', '90d', '1y'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRange === range ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Recurring Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatINR(metrics.monthlyRecurringRevenueINR)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold font-mono">+12.4%</span> vs previous quarter
          </p>
        </Card>

        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Customers</span>
            <Building2 className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {metrics.totalCustomers}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.activeOrganizations} active fleets in production
          </p>
        </Card>

        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monitored Fleet Size</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {metrics.registeredVehiclesAcrossOrgs}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Vehicles across {metrics.totalCustomers} licensed enterprises
          </p>
        </Card>

        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Invoices</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatINR(metrics.outstandingInvoicesAmountINR)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.outstandingInvoicesCount} invoices pending collection
          </p>
        </Card>
      </div>

      {/* KPI Cards Row 2 (Operational Exceptions) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 bg-brand-50/50 border border-brand-200 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-4 h-4 text-brand-700" />
            <div>
              <span className="font-semibold text-brand-900">New Accounts (Last 30 Days):</span>{' '}
              <span className="font-mono font-bold text-brand-800">{metrics.newCustomersThisMonth}</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.ADMIN.CUSTOMERS)} className="h-7 text-xs bg-white">
            View All
          </Button>
        </div>

        <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-700" />
            <div>
              <span className="font-semibold text-amber-900">Trials Expiring Soon (7d):</span>{' '}
              <span className="font-mono font-bold text-amber-800">{metrics.trialsExpiringSoon}</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.ADMIN.SUBSCRIPTIONS)} className="h-7 text-xs bg-white border-amber-300 text-amber-900">
            Review Trials
          </Button>
        </div>

        <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-700" />
            <div>
              <span className="font-semibold text-rose-900">Overdue Invoices:</span>{' '}
              <span className="font-mono font-bold text-rose-800">
                {state.invoices.filter(i => i.status === 'overdue').length}
              </span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.ADMIN.INVOICES)} className="h-7 text-xs bg-white border-rose-300 text-rose-900">
            Collections
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>MRR Growth Trajectory</CardTitle>
              <CardDescription>Monthly Recurring Revenue from enterprise subscriptions (INR)</CardDescription>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700">
              Current: {formatINR(metrics.monthlyRecurringRevenueINR)}
            </span>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={val => `₹${val / 1000}k`} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(value: any) => [formatINR(Number(value)), 'MRR']} 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} 
                />
                <Area type="monotone" dataKey="mrr" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#mrrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Subscription Plan Mix</CardTitle>
              <CardDescription>Distribution across customer fleet tiers</CardDescription>
            </div>
          </CardHeader>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionDistribution}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} Organizations`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1 text-xs border-t border-slate-100 pt-2.5">
            {subscriptionDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono font-medium text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Customer Directory Snapshot */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Enterprise Client Accounts</CardTitle>
            <CardDescription>Latest commercial organizations active on SafeDrive platform</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.ADMIN.CUSTOMERS)}>
            Manage All Customers
          </Button>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-3 font-semibold">Client Name</th>
                <th className="py-2.5 px-3 font-semibold">Contact Person</th>
                <th className="py-2.5 px-3 font-semibold">Tier</th>
                <th className="py-2.5 px-3 font-semibold text-right">Vehicles</th>
                <th className="py-2.5 px-3 font-semibold text-right">Monthly Rev</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.customers.slice(0, 5).map(cust => (
                <tr 
                  key={cust.id} 
                  onClick={() => navigate(ROUTES.ADMIN.CUSTOMER_DETAIL(cust.id))}
                  className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-slate-900">{cust.companyName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{cust.contactPerson}</td>
                  <td className="py-2.5 px-3">
                    <span className="capitalize text-slate-600">{cust.accountType}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800">{cust.registeredVehicles}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                    {formatINR(cust.monthlyRevenueINR)}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={cust.status === 'active' ? 'safe' : cust.status === 'trial' ? 'warning' : 'critical'}>
                      {cust.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{formatDate(cust.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Customer Modal */}
      <CustomerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateCustomer}
      />
    </div>
  );
};
