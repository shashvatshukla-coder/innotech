import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, Clock, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SearchFilterBar } from '../../components/ui/search-filter-bar';
import { Pagination } from '../../components/ui/pagination';
import { mockStore } from '../../services/mock/mock-store';
import { Invoice } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockStore.getState().invoices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    return mockStore.subscribe(() => {
      setInvoices(mockStore.getState().invoices);
    });
  }, []);

  const filtered = invoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return inv.id.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDownloadInvoice = (inv: Invoice) => {
    const text = `SAFEDRIVE AI - TAX INVOICE\n----------------------------\nInvoice ID: ${inv.id}\nCustomer: ${inv.customerName}\nIssue Date: ${inv.issueDate}\nDue Date: ${inv.dueDate}\nStatus: ${inv.status.toUpperCase()}\nAmount: INR ${inv.amountINR}\nLicensed Vehicles: ${inv.vehicleCount}\n\nThis is a computer generated simulated tax invoice.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Commercial Invoices & Billing Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            SaaS subscription and hardware unit invoices denominated in Indian Rupees (INR).
          </p>
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <SearchFilterBar
            value={search}
            onChange={val => { setSearch(val); setPage(1); }}
            placeholder="Search by invoice ID or customer name..."
          >
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </SearchFilterBar>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                <th className="py-2.5 px-3 font-semibold">Client Company</th>
                <th className="py-2.5 px-3 font-semibold">Plan</th>
                <th className="py-2.5 px-3 font-semibold">Issue Date</th>
                <th className="py-2.5 px-3 font-semibold">Due Date</th>
                <th className="py-2.5 px-3 font-semibold text-right">Amount (INR)</th>
                <th className="py-2.5 px-3 font-semibold">Payment Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono font-medium text-brand-700">{inv.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{inv.customerName}</td>
                  <td className="py-2.5 px-3 capitalize">{inv.plan.replace(/_/g, ' ')}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">{formatDate(inv.issueDate)}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">{formatDate(inv.dueDate)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(inv.amountINR)}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={inv.status === 'paid' ? 'safe' : inv.status === 'pending' ? 'warning' : 'critical'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadInvoice(inv)}
                      className="h-7 px-2 text-xs gap-1"
                      title="Download Invoice Text"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </Button>
                  </td>
                </tr>
              ))}
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
