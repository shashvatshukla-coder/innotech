import { describe, it, expect } from 'vitest';
import { 
  selectAdminMetrics, 
  selectFleetOwnerMetrics, 
  selectIncidentTrends, 
  selectCategoryBreakdown 
} from '../utils/selectors';
import { 
  SEED_CUSTOMERS, 
  SEED_SUBSCRIPTIONS, 
  SEED_INVOICES, 
  SEED_VEHICLES, 
  SEED_DRIVERS, 
  SEED_DEVICES, 
  SEED_INCIDENTS 
} from '../services/mock/seed-data';

describe('Domain Selectors & Mathematical Aggregations', () => {
  it('correctly aggregates Admin KPIs from raw entities', () => {
    const metrics = selectAdminMetrics(
      SEED_CUSTOMERS,
      SEED_SUBSCRIPTIONS,
      SEED_INVOICES,
      SEED_VEHICLES
    );

    expect(metrics.totalCustomers).toBe(SEED_CUSTOMERS.length);
    expect(metrics.registeredVehiclesAcrossOrgs).toBe(SEED_VEHICLES.length);
    expect(metrics.monthlyRecurringRevenueINR).toBeGreaterThan(0);
    
    // Sum of active subscriptions should match
    const manualMRR = SEED_SUBSCRIPTIONS
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.amountINR, 0);
    expect(metrics.monthlyRecurringRevenueINR).toBe(manualMRR);

    // Outstanding invoices amount calculation
    const manualOutstanding = SEED_INVOICES
      .filter(i => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.amountINR, 0);
    expect(metrics.outstandingInvoicesAmountINR).toBe(manualOutstanding);
  });

  it('correctly aggregates Fleet Owner KPIs with single source of truth', () => {
    const metrics = selectFleetOwnerMetrics(
      SEED_VEHICLES,
      SEED_DRIVERS,
      SEED_DEVICES,
      SEED_INCIDENTS
    );

    expect(metrics.totalVehicles).toBe(SEED_VEHICLES.length);
    expect(metrics.totalDevices).toBe(SEED_DEVICES.length);
    expect(metrics.onlineMonitoringDevices).toBe(
      SEED_DEVICES.filter(d => d.connectionState === 'online').length
    );
    expect(metrics.fleetSafetyScore).toBeGreaterThanOrEqual(40);
    expect(metrics.fleetSafetyScore).toBeLessThanOrEqual(100);
  });

  it('generates non-empty daily incident trends without fabricating data', () => {
    const trends = selectIncidentTrends(SEED_INCIDENTS, 7);
    expect(trends).toHaveLength(7);
    expect(trends[0]).toHaveProperty('date');
    expect(trends[0]).toHaveProperty('warning');
    expect(trends[0]).toHaveProperty('critical');
  });

  it('breaks down violation categories strictly from source records', () => {
    const breakdown = selectCategoryBreakdown(SEED_INCIDENTS);
    const totalEventsInBreakdown = breakdown.reduce((sum, b) => sum + b.count, 0);
    expect(totalEventsInBreakdown).toBe(SEED_INCIDENTS.length);
  });
});
