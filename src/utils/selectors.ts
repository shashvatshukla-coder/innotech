// SafeDrive AI - Pure Domain Selectors & Metric Aggregations
// Single source of truth: every KPI card, badge, and summary is calculated directly from active entities.

import { 
  Customer, 
  Invoice, 
  Vehicle, 
  Driver, 
  MonitoringDevice, 
  SafetyIncident, 
  Subscription 
} from '../types';

export interface AdminMetrics {
  totalCustomers: number;
  activeOrganizations: number;
  registeredVehiclesAcrossOrgs: number;
  activeSubscriptions: number;
  monthlyRecurringRevenueINR: number;
  newCustomersThisMonth: number;
  trialsExpiringSoon: number;
  outstandingInvoicesCount: number;
  outstandingInvoicesAmountINR: number;
}

export function selectAdminMetrics(
  customers: Customer[],
  subscriptions: Subscription[],
  invoices: Invoice[],
  vehicles: Vehicle[]
): AdminMetrics {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active' || c.status === 'trial');
  
  // Calculate MRR from active subscriptions
  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amountINR, 0);

  // New customers created in the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newCustomersThisMonth = customers.filter(c => new Date(c.createdAt) >= thirtyDaysAgo).length;

  // Trials expiring within 7 days
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const trialsExpiringSoon = subscriptions.filter(s => {
    if (s.status !== 'trial') return false;
    const renewal = new Date(s.renewalDate);
    return renewal >= now && renewal <= sevenDaysFromNow;
  }).length;

  // Outstanding invoices (pending or overdue)
  const outstandingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const outstandingInvoicesCount = outstandingInvoices.length;
  const outstandingInvoicesAmountINR = outstandingInvoices.reduce((sum, i) => sum + i.amountINR, 0);

  return {
    totalCustomers,
    activeOrganizations: activeCustomers.length,
    registeredVehiclesAcrossOrgs: vehicles.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    monthlyRecurringRevenueINR: mrr,
    newCustomersThisMonth,
    trialsExpiringSoon,
    outstandingInvoicesCount,
    outstandingInvoicesAmountINR,
  };
}

export interface FleetOwnerMetrics {
  totalVehicles: number;
  activeVehicles: number;
  onlineMonitoringDevices: number;
  totalDevices: number;
  driversAssigned: number;
  totalDrivers: number;
  warningsToday: number;
  criticalIncidentsToday: number;
  incidentsAwaitingReview: number;
  fleetSafetyScore: number; // 0-100 calculated derived score
}

export function selectFleetOwnerMetrics(
  vehicles: Vehicle[],
  drivers: Driver[],
  devices: MonitoringDevice[],
  incidents: SafetyIncident[]
): FleetOwnerMetrics {
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  
  const totalDevices = devices.length;
  const onlineMonitoringDevices = devices.filter(d => d.connectionState === 'online').length;

  const totalDrivers = drivers.length;
  const driversAssigned = drivers.filter(d => !!d.assignedVehicleId).length;

  // Incidents today (within current 24-hour cycle)
  const todayStr = new Date().toISOString().split('T')[0];
  const incidentsToday = incidents.filter(i => i.timestamp.startsWith(todayStr));
  
  const warningsToday = incidentsToday.filter(i => i.severity === 'warning').length;
  const criticalIncidentsToday = incidentsToday.filter(i => i.severity === 'critical').length;

  const incidentsAwaitingReview = incidents.filter(
    i => i.reviewStatus === 'pending' || i.reviewStatus === 'under_review'
  ).length;

  // Disciplined derived Fleet Safety Score: 100 minus weighted penalties for critical/warning incidents
  // Normalizing per active vehicle
  const totalWarnings = incidents.filter(i => i.severity === 'warning').length;
  const totalCritical = incidents.filter(i => i.severity === 'critical').length;
  const incidentDeduction = activeVehicles > 0 
    ? Math.min(60, ((totalCritical * 4) + (totalWarnings * 1.5)) / activeVehicles)
    : 0;
  const fleetSafetyScore = Math.round(Math.max(40, 100 - incidentDeduction));

  return {
    totalVehicles,
    activeVehicles,
    onlineMonitoringDevices,
    totalDevices,
    driversAssigned,
    totalDrivers,
    warningsToday,
    criticalIncidentsToday,
    incidentsAwaitingReview,
    fleetSafetyScore,
  };
}

/**
 * Group incidents by date for trend chart
 */
export function selectIncidentTrends(incidents: SafetyIncident[], days: number = 7) {
  const result: Record<string, { date: string; warning: number; critical: number; safe: number }> = {};
  
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split('T')[0];
    const displayLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    result[dateKey] = { date: displayLabel, warning: 0, critical: 0, safe: 0 };
  }

  incidents.forEach(inc => {
    const dateKey = inc.timestamp.split('T')[0];
    if (result[dateKey]) {
      if (inc.severity === 'warning') result[dateKey].warning += 1;
      else if (inc.severity === 'critical') result[dateKey].critical += 1;
      else result[dateKey].safe += 1;
    }
  });

  return Object.values(result);
}

/**
 * Group incidents by category for breakdown chart
 */
export function selectCategoryBreakdown(incidents: SafetyIncident[]) {
  const map: Record<string, number> = {};
  incidents.forEach(inc => {
    map[inc.category] = (map[inc.category] || 0) + 1;
  });

  return Object.entries(map).map(([category, count]) => ({
    category,
    name: category.replace(/_/g, ' '),
    count,
  }));
}

/**
 * Top drivers by incident count
 */
export function selectTopDriversByIncidents(drivers: Driver[], incidents: SafetyIncident[]) {
  const map: Record<string, { driverId: string; name: string; warning: number; critical: number; total: number }> = {};

  drivers.forEach(d => {
    map[d.id] = { driverId: d.id, name: d.fullName, warning: 0, critical: 0, total: 0 };
  });

  incidents.forEach(inc => {
    if (map[inc.driverId]) {
      if (inc.severity === 'critical') map[inc.driverId].critical += 1;
      else if (inc.severity === 'warning') map[inc.driverId].warning += 1;
      map[inc.driverId].total += 1;
    }
  });

  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}
