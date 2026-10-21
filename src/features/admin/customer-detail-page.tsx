import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Truck, CreditCard, Mail, Phone, MapPin, Calendar, Edit3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { mockStore } from '../../services/mock/mock-store';
import { apiClient } from '../../services/api/client';
import { Customer } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editContact, setEditContact] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    const cust = mockStore.getState().customers.find(c => c.id === id);
    if (cust) {
      setCustomer(cust);
      setEditContact(cust.contactPerson);
      setEditEmail(cust.email);
      setEditPhone(cust.phone);
    }
  }, [id]);

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-800">Customer Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The customer identifier does not exist or was deleted.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.ADMIN.CUSTOMERS)} className="mt-4">
          Return to Customer List
        </Button>
      </div>
    );
  }

  const organization = mockStore.getState().organizations.find(o => o.customerId === customer.id);
  const subscription = mockStore.getState().subscriptions.find(s => s.customerId === customer.id);
  const invoices = mockStore.getState().invoices.filter(i => i.customerId === customer.id);

  const handleUpdate = async () => {
    const updated = await apiClient.updateCustomer(customer.id, {
      contactPerson: editContact,
      email: editEmail,
      phone: editPhone,
    });
    setCustomer(updated);
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.ADMIN.CUSTOMERS)} className="h-8 px-2.5">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Customers</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{customer.companyName}</span>
              <span className="text-xs font-mono font-normal text-slate-400">({customer.id})</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={customer.status === 'active' ? 'safe' : customer.status === 'trial' ? 'warning' : 'critical'}>
            {customer.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="gap-1.5 h-8">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Contact Details</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-xs">
            <div className="font-semibold text-slate-900 text-sm">{customer.contactPerson}</div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 pt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.address.city}, {customer.address.state} - {customer.address.pincode}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Subscription & Fleet</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tier:</span>
              <span className="font-medium capitalize text-slate-900">{customer.accountType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Active Plan:</span>
              <span className="font-medium text-slate-900 capitalize">{customer.plan.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Registered Vehicles:</span>
              <span className="font-mono font-bold text-slate-900">{customer.registeredVehicles} Units</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500">Monthly Contract Value:</span>
              <span className="font-mono font-bold text-emerald-700">{formatINR(customer.monthlyRevenueINR)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Contract Lifecycle</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Created Date:</span>
              <span className="font-mono text-slate-700">{formatDate(customer.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Renewal Date:</span>
              <span className="font-mono font-semibold text-slate-900">{formatDate(customer.renewalDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Account Manager:</span>
              <span className="text-slate-700 font-medium">{organization?.accountManager || 'Neha Kapoor'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices List */}
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Billing & Invoice History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Simulated enterprise invoices generated for this client account.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Invoice ID</th>
                <th className="py-2.5 px-3 font-semibold">Issue Date</th>
                <th className="py-2.5 px-3 font-semibold">Due Date</th>
                <th className="py-2.5 px-3 font-semibold text-right">Amount (INR)</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    No invoices recorded for this customer.
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="py-2.5 px-3 font-mono font-medium text-brand-700">{inv.id}</td>
                    <td className="py-2.5 px-3 text-slate-600">{formatDate(inv.issueDate)}</td>
                    <td className="py-2.5 px-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                      {formatINR(inv.amountINR)}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={inv.status === 'paid' ? 'safe' : inv.status === 'pending' ? 'warning' : 'critical'}>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Update Customer Contact"
        description="Update operational contact person and notification coordinates."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Primary Contact Person"
            value={editContact}
            onChange={e => setEditContact(e.target.value)}
          />
          <Input
            label="Corporate Email"
            type="email"
            value={editEmail}
            onChange={e => setEditEmail(e.target.value)}
          />
          <Input
            label="Phone"
            value={editPhone}
            onChange={e => setEditPhone(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
