import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { RegisterVehicleDTO } from '../../services/api/types';
import { mockStore } from '../../services/mock/mock-store';

const vehicleSchema = z.object({
  registrationNumber: z.string().min(8, 'Valid Indian registration format required (e.g. MH-12-AB-1234)'),
  makeModel: z.string().min(3, 'Make & Model is required (e.g. Tata Prima 5530.S)'),
  vehicleType: z.enum([
    'Heavy Truck (16-Wheel)',
    'Heavy Commercial (10-Wheel)',
    'Medium Hauler',
    'Refrigerated Carrier',
    'Tanker Trailer',
    'Express Container',
  ]),
  year: z.coerce.number().min(2010, 'Year must be 2010 or newer').max(2027, 'Invalid model year'),
  assignedDriverId: z.string().optional(),
  deviceId: z.string().optional(),
  depotLocation: z.string().min(3, 'Depot location is required'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: RegisterVehicleDTO) => Promise<void>;
  isLoading?: boolean;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const drivers = mockStore.getState().drivers;
  const devices = mockStore.getState().devices;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: 'Heavy Truck (16-Wheel)',
      year: 2024,
      depotLocation: 'Pune Central Cargo Hub',
    },
  });

  const handleFormSubmit = async (data: VehicleFormData) => {
    await onSubmit({
      ...data,
      organizationId: 'ORG-BHARAT-01',
    });
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Fleet Commercial Vehicle"
      description="Enroll a heavy commercial vehicle and pair with an onboard SafeDrive AI edge camera."
      maxWidth="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="vehicle-form" variant="primary" isLoading={isLoading}>
            Register Vehicle
          </Button>
        </>
      }
    >
      <form id="vehicle-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Registration Number (Number Plate)"
            placeholder="e.g. MH-12-RN-4821"
            {...register('registrationNumber')}
            error={errors.registrationNumber?.message}
          />

          <Input
            label="Chassis Make & Model"
            placeholder="e.g. Tata Prima 5530.S"
            {...register('makeModel')}
            error={errors.makeModel?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Vehicle Category"
            options={[
              { label: 'Heavy Truck (16-Wheel)', value: 'Heavy Truck (16-Wheel)' },
              { label: 'Heavy Commercial (10-Wheel)', value: 'Heavy Commercial (10-Wheel)' },
              { label: 'Medium Hauler', value: 'Medium Hauler' },
              { label: 'Refrigerated Carrier', value: 'Refrigerated Carrier' },
              { label: 'Tanker Trailer', value: 'Tanker Trailer' },
              { label: 'Express Container', value: 'Express Container' },
            ]}
            {...register('vehicleType')}
            error={errors.vehicleType?.message}
          />

          <Input
            label="Manufacturing Year"
            type="number"
            {...register('year')}
            error={errors.year?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assigned Primary Driver"
            options={[
              { label: 'Select Driver (Optional)', value: '' },
              ...drivers.map(d => ({ label: `${d.fullName} (${d.id})`, value: d.id })),
            ]}
            {...register('assignedDriverId')}
          />

          <Select
            label="Paired Onboard Edge Device"
            options={[
              { label: 'Select Device (Optional)', value: '' },
              ...devices.map(dev => ({ label: `${dev.name} (${dev.id})`, value: dev.id })),
            ]}
            {...register('deviceId')}
          />
        </div>

        <Input
          label="Home Depot / Logistics Yard Location"
          placeholder="e.g. Pune Central Cargo Hub, Maharashtra"
          {...register('depotLocation')}
          error={errors.depotLocation?.message}
        />
      </form>
    </Modal>
  );
};
