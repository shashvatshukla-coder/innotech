import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const customerSchema = z.object({
  companyName: z.string().min(3),
  contactPerson: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  accountType: z.enum(['enterprise', 'growth', 'starter']),
  plan: z.enum(['starter_fleet', 'professional_safety', 'enterprise_ai']),
  registeredVehicles: z.coerce.number().min(1).max(1000),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6).max(6),
});

const vehicleSchema = z.object({
  registrationNumber: z.string().min(8),
  makeModel: z.string().min(3),
  vehicleType: z.enum([
    'Heavy Truck (16-Wheel)',
    'Heavy Commercial (10-Wheel)',
    'Medium Hauler',
    'Refrigerated Carrier',
    'Tanker Trailer',
    'Express Container',
  ]),
  year: z.coerce.number().min(2010).max(2027),
  depotLocation: z.string().min(3),
});

describe('Zod Validation Schemas', () => {
  it('validates a correct Indian transport enterprise customer payload', () => {
    const validData = {
      companyName: 'Sahyadri Freightways Ltd',
      contactPerson: 'Anand Kulkarni',
      email: 'anand@sahyadri.in',
      phone: '+91 98220 12345',
      accountType: 'enterprise' as const,
      plan: 'professional_safety' as const,
      registeredVehicles: 12,
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
    };

    const result = customerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid customer email and missing fields', () => {
    const invalidData = {
      companyName: 'AB', // too short
      contactPerson: '',
      email: 'not-an-email',
      phone: '123', // too short
      accountType: 'enterprise' as const,
      plan: 'professional_safety' as const,
      registeredVehicles: 0, // must be >= 1
      city: '',
      state: '',
      pincode: '41', // invalid length
    };

    const result = customerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.companyName).toBeDefined();
      expect(fieldErrors.email).toBeDefined();
      expect(fieldErrors.registeredVehicles).toBeDefined();
    }
  });

  it('validates commercial vehicle registration data', () => {
    const validVehicle = {
      registrationNumber: 'MH-12-RN-4821',
      makeModel: 'Tata Prima 5530.S',
      vehicleType: 'Heavy Truck (16-Wheel)' as const,
      year: 2023,
      depotLocation: 'Pune Central Cargo Hub',
    };

    const result = vehicleSchema.safeParse(validVehicle);
    expect(result.success).toBe(true);
  });
});
