import { describe, it, expect, beforeEach } from 'vitest';
import { mockStore } from '../services/mock/mock-store';
import { apiClient } from '../services/api/client';
import { selectAdminMetrics } from '../utils/selectors';

describe('End-to-End Enterprise Workflows (Mock State Engine)', () => {
  beforeEach(() => {
    mockStore.resetToDefault();
  });

  it('Workflow A: Admin creates customer, updates profile, and verifies derived metrics update', async () => {
    const initialMetrics = selectAdminMetrics(
      mockStore.getState().customers,
      mockStore.getState().subscriptions,
      mockStore.getState().invoices,
      mockStore.getState().vehicles
    );

    // 1. Create Customer
    const created = await apiClient.createCustomer({
      companyName: 'Sahyadri Trans Logistics',
      contactPerson: 'Milind Sane',
      email: 'milind@sahyadri.in',
      phone: '+91 98220 99881',
      accountType: 'enterprise',
      plan: 'enterprise_ai',
      registeredVehicles: 10,
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
    });

    expect(created.id).toBeDefined();
    expect(created.companyName).toBe('Sahyadri Trans Logistics');

    // 2. Metrics should immediately recalculate with the new customer
    const updatedMetrics = selectAdminMetrics(
      mockStore.getState().customers,
      mockStore.getState().subscriptions,
      mockStore.getState().invoices,
      mockStore.getState().vehicles
    );

    expect(updatedMetrics.totalCustomers).toBe(initialMetrics.totalCustomers + 1);
    expect(updatedMetrics.monthlyRecurringRevenueINR).toBe(
      initialMetrics.monthlyRecurringRevenueINR + created.monthlyRevenueINR
    );

    // 3. Update customer
    const updated = await apiClient.updateCustomer(created.id, {
      contactPerson: 'Milind Sane (Director)',
    });
    expect(updated.contactPerson).toBe('Milind Sane (Director)');

    // 4. Deactivate customer
    const deactivated = await apiClient.deactivateCustomer(created.id);
    expect(deactivated.status).toBe('deactivated');
  });

  it('Workflow B: Fleet Owner reviews safety incident, adds notes, and verifies audit trail', async () => {
    const incident = mockStore.getState().incidents[0];
    expect(incident).toBeDefined();

    const initialAuditCount = incident.auditTrail.length;

    // Add review note and mark reviewed
    const reviewed = await apiClient.addIncidentReview(
      incident.id,
      {
        note: 'Driver was counselled regarding hands-free communication protocols.',
        markReviewed: true,
      },
      'Sunil Rao (Safety Officer)'
    );

    expect(reviewed.reviewStatus).toBe('reviewed');
    expect(reviewed.reviewedBy).toBe('Sunil Rao (Safety Officer)');
    expect(reviewed.reviewNotes).toBe('Driver was counselled regarding hands-free communication protocols.');
    expect(reviewed.auditTrail.length).toBe(initialAuditCount + 1);
    expect(reviewed.auditTrail[reviewed.auditTrail.length - 1].action).toBe('marked_reviewed');
  });

  it('Workflow C: AI Device Lab session start, simulated violation injection, and stop lifecycle', async () => {
    const deviceId = 'DEV-LAB-TESTER';

    // 1. Start session
    const session = await apiClient.startMonitoring({
      deviceId,
      driverId: 'DRV-001',
      vehicleId: 'VEH-MH-12-4821',
    });

    expect(session.id).toBeDefined();
    expect(session.state).toBe('active');

    // 2. Trigger simulated violation
    const evt = await apiClient.triggerSimulatedEvent(deviceId, 'phone_use', 'warning');
    expect(evt.id).toBeDefined();
    expect(evt.category).toBe('phone_use');
    expect(evt.severity).toBe('warning');

    // Check that event was added to mock store
    const deviceEvents = await apiClient.getDeviceEvents(deviceId);
    expect(deviceEvents.some(e => e.id === evt.id)).toBe(true);

    // 3. Stop session
    const stopped = await apiClient.stopMonitoring(session.id);
    expect(stopped.state).toBe('completed');
    expect(stopped.endedAt).toBeDefined();
  });
});
