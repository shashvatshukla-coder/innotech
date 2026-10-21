import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { CreateCustomerDTO } from '../../services/api/types';

const customerSchema = z.object({
  companyName: z.string().min(3, 'Company name must be at least 3 characters'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Please enter a valid business email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  accountType: z.enum(['enterprise', 'growth', 'starter']),
  plan: z.enum(['starter_fleet', 'professional_safety', 'enterprise_ai']),
  registeredVehicles: z.coerce.number().min(1, 'At least 1 vehicle is required').max(1000, 'Max 1000 vehicles'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6, 'Pincode must be 6 digits'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerDTO) => Promise<void>;
  isLoading?: boolean;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      accountType: 'enterprise',
      plan: 'professional_safety',
      registeredVehicles: 5,
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
    },
  });

  const handleFormSubmit = async (data: CustomerFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Commercial Transport Client"
      description="Create a new fleet organization account with subscribed monitoring devices."
      maxWidth="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" variant="primary" isLoading={isLoading}>
            Create Customer Account
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Company / Fleet Name"
            placeholder="e.g. Sahyadri Logistics Ltd"
            {...register('companyName')}
            error={errors.companyName?.message}
          />
          <Input
            label="Primary Contact Person"
            placeholder="e.g. Anand Kulkarni"
            {...register('contactPerson')}
            error={errors.contactPerson?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Corporate Email"
            type="email"
            placeholder="operations@sahyadri.in"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Official Mobile Phone"
            placeholder="+91 98220 12345"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Account Tier"
            options={[
              { label: 'Enterprise', value: 'enterprise' },
              { label: 'Growth', value: 'growth' },
              { label: 'Starter', value: 'starter' },
            ]}
            {...register('accountType')}
            error={errors.accountType?.message}
          />

          <Select
            label="Subscription Plan"
            options={[
              { label: 'Enterprise AI (₹2.4L/mo)', value: 'enterprise_ai' },
              { label: 'Pro Safety (₹1.25L/mo)', value: 'professional_safety' },
              { label: 'Starter Fleet (₹45k/mo)', value: 'starter_fleet' },
            ]}
            {...register('plan')}
            error={errors.plan?.message}
          />

          <Input
            label="Initial Vehicles"
            type="number"
            {...register('registeredVehicles')}
            error={errors.registeredVehicles?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Depot City"
            placeholder="Pune"
            {...register('city')}
            error={errors.city?.message}
          />
          <Input
            label="State"
            placeholder="Maharashtra"
            {...register('state')}
            error={errors.state?.message}
          />
          <Input
            label="Pincode"
            placeholder="411001"
            {...register('pincode')}
            error={errors.pincode?.message}
          />
        </div>
      </form>
    </Modal>
  );
};
