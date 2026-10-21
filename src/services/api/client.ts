// SafeDrive AI - API Client Adapter
// Implements IApiClient with support for Demo Mode (MockStore) and Real API Mode (configured backend)

import { 
  Customer, 
  Organization, 
  Vehicle, 
  Driver, 
  MonitoringDevice, 
  SafetyIncident, 
  DetectionEvent, 
  MonitoringSession,
  Subscription,
  Invoice,
  SyncJob,
  AIThresholdConfig,
  ReportFilter
} from '../../types';
import { 
  IApiClient, 
  CreateCustomerDTO, 
  UpdateCustomerDTO, 
  RegisterVehicleDTO, 
  AddReviewNoteDTO, 
  StartMonitoringSessionDTO 
} from './types';
import { mockStore } from '../mock/mock-store';

class ApiClient implements IApiClient {
  private baseUrl: string;
  private mode: 'demo' | 'real';

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    // If VITE_API_MODE is explicitly set to 'real', use real mode, else default to demo
    const configuredMode = import.meta.env.VITE_API_MODE || (this.baseUrl ? 'real' : 'demo');
    this.mode = configuredMode === 'real' ? 'real' : 'demo';
  }

  public isDemoMode(): boolean {
    return this.mode === 'demo';
  }

  public setMode(mode: 'demo' | 'real') {
    this.mode = mode;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (this.mode === 'real') {
      const url = `${this.baseUrl}${endpoint}`;
      try {
        const res = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        });
        if (!res.ok) {
          throw new Error(`API error [${res.status}]: ${res.statusText}`);
        }
        return await res.json();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Backend unavailable at ${url}: ${message}`);
      }
    }
    throw new Error('request() called directly outside real mode');
  }

  // --- Customers ---
  async getCustomers(): Promise<Customer[]> {
    if (this.mode === 'real') return this.request<Customer[]>('/api/customers');
    return Promise.resolve([...mockStore.getState().customers]);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    if (this.mode === 'real') return this.request<Customer>(`/api/customers/${id}`);
    const found = mockStore.getState().customers.find(c => c.id === id);
    return Promise.resolve(found || null);
  }

  async createCustomer(dto: CreateCustomerDTO): Promise<Customer> {
    if (this.mode === 'real') {
      return this.request<Customer>('/api/customers', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    }

    const newId = `CUST-${Date.now().toString().slice(-4)}`;
    const newCust: Customer = {
      id: newId,
      companyName: dto.companyName,
      contactPerson: dto.contactPerson,
      email: dto.email,
      phone: dto.phone,
      accountType: dto.accountType,
      registeredVehicles: dto.registeredVehicles,
      plan: dto.plan,
      status: 'active',
      createdAt: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyRevenueINR: dto.plan === 'enterprise_ai' ? 240000 : dto.plan === 'professional_safety' ? 125000 : 45000,
      address: {
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
      },
    };

    const newOrg: Organization = {
      id: `ORG-${newId}`,
      customerId: newId,
      name: dto.companyName,
      legalEntity: `${dto.companyName} Pvt Ltd`,
      industry: 'Transport & Logistics',
      fleetSize: dto.registeredVehicles,
      driverCount: dto.registeredVehicles,
      activeDevicesCount: 0,
      plan: dto.plan,
      accountManager: 'Neha Kapoor',
      contractStatus: 'active',
      hqLocation: `${dto.city}, ${dto.state}`,
      createdAt: newCust.createdAt,
    };

    const newSub: Subscription = {
      id: `SUB-${newId}`,
      customerId: newId,
      customerName: dto.companyName,
      plan: dto.plan,
      billingCycle: 'monthly',
      amountINR: newCust.monthlyRevenueINR,
      status: 'active',
      startDate: newCust.createdAt.split('T')[0],
      renewalDate: newCust.renewalDate.split('T')[0],
      autoRenew: true,
      activeVehicles: dto.registeredVehicles,
      maxVehicles: dto.registeredVehicles + 5,
    };

    mockStore.addCustomer(newCust, newOrg, newSub);
    return Promise.resolve(newCust);
  }

  async updateCustomer(id: string, dto: UpdateCustomerDTO): Promise<Customer> {
    if (this.mode === 'real') {
      return this.request<Customer>(`/api/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    }

    mockStore.updateCustomer(id, dto);
    const updated = mockStore.getState().customers.find(c => c.id === id);
    if (!updated) throw new Error('Customer not found');
    return Promise.resolve(updated);
  }

  async deactivateCustomer(id: string): Promise<Customer> {
    if (this.mode === 'real') {
      return this.request<Customer>(`/api/customers/${id}/deactivate`, { method: 'POST' });
    }
    mockStore.deactivateCustomer(id);
    const updated = mockStore.getState().customers.find(c => c.id === id);
    if (!updated) throw new Error('Customer not found');
    return Promise.resolve(updated);
  }

  // --- Organizations & Subscriptions ---
  async getOrganizations(): Promise<Organization[]> {
    if (this.mode === 'real') return this.request<Organization[]>('/api/companies');
    return Promise.resolve([...mockStore.getState().organizations]);
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    if (this.mode === 'real') return this.request<Organization>(`/api/companies/${id}`);
    const found = mockStore.getState().organizations.find(o => o.id === id);
    return Promise.resolve(found || null);
  }

  async getSubscriptions(): Promise<Subscription[]> {
    if (this.mode === 'real') return this.request<Subscription[]>('/api/subscriptions');
    return Promise.resolve([...mockStore.getState().subscriptions]);
  }

  async getInvoices(): Promise<Invoice[]> {
    if (this.mode === 'real') return this.request<Invoice[]>('/api/invoices');
    return Promise.resolve([...mockStore.getState().invoices]);
  }

  // --- Fleet ---
  async getVehicles(orgId?: string): Promise<Vehicle[]> {
    if (this.mode === 'real') return this.request<Vehicle[]>(`/api/vehicles${orgId ? `?orgId=${orgId}` : ''}`);
    const vehicles = mockStore.getState().vehicles;
    if (orgId) return Promise.resolve(vehicles.filter(v => v.organizationId === orgId));
    return Promise.resolve([...vehicles]);
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    if (this.mode === 'real') return this.request<Vehicle>(`/api/vehicles/${id}`);
    const found = mockStore.getState().vehicles.find(v => v.id === id || v.registrationNumber === id);
    return Promise.resolve(found || null);
  }

  async registerVehicle(dto: RegisterVehicleDTO): Promise<Vehicle> {
    if (this.mode === 'real') {
      return this.request<Vehicle>('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    }

    const newVehicle: Vehicle = {
      id: `VEH-${Date.now().toString().slice(-4)}`,
      organizationId: dto.organizationId,
      registrationNumber: dto.registrationNumber,
      makeModel: dto.makeModel,
      vehicleType: dto.vehicleType,
      year: dto.year,
      assignedDriverId: dto.assignedDriverId,
      deviceId: dto.deviceId,
      deviceStatus: dto.deviceId ? 'online' : 'offline',
      lastSyncAt: new Date().toISOString(),
      totalIncidentsCount: 0,
      status: 'active',
      depotLocation: dto.depotLocation,
    };
    mockStore.addVehicle(newVehicle);
    return Promise.resolve(newVehicle);
  }

  async getDrivers(orgId?: string): Promise<Driver[]> {
    if (this.mode === 'real') return this.request<Driver[]>(`/api/drivers${orgId ? `?orgId=${orgId}` : ''}`);
    const drivers = mockStore.getState().drivers;
    if (orgId) return Promise.resolve(drivers.filter(d => d.organizationId === orgId));
    return Promise.resolve([...drivers]);
  }

  async getDriverById(id: string): Promise<Driver | null> {
    if (this.mode === 'real') return this.request<Driver>(`/api/drivers/${id}`);
    const found = mockStore.getState().drivers.find(d => d.id === id);
    return Promise.resolve(found || null);
  }

  // --- Incidents ---
  async getIncidents(filter?: ReportFilter): Promise<SafetyIncident[]> {
    if (this.mode === 'real') {
      const q = new URLSearchParams(filter as unknown as Record<string, string>).toString();
      return this.request<SafetyIncident[]>(`/api/incidents?${q}`);
    }

    let list = [...mockStore.getState().incidents];
    if (filter) {
      if (filter.organizationId) list = list.filter(i => i.organizationId === filter.organizationId);
      if (filter.category && filter.category !== 'all') list = list.filter(i => i.category === filter.category);
      if (filter.severity && filter.severity !== 'all') list = list.filter(i => i.severity === filter.severity);
      if (filter.reviewStatus && filter.reviewStatus !== 'all') list = list.filter(i => i.reviewStatus === filter.reviewStatus);
      if (filter.driverId) list = list.filter(i => i.driverId === filter.driverId);
      if (filter.vehicleId) list = list.filter(i => i.vehicleId === filter.vehicleId);
      if (filter.startDate) list = list.filter(i => i.timestamp >= filter.startDate);
      if (filter.endDate) list = list.filter(i => i.timestamp <= filter.endDate);
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        list = list.filter(i => 
          i.id.toLowerCase().includes(query) ||
          i.driverName.toLowerCase().includes(query) ||
          i.vehicleReg.toLowerCase().includes(query) ||
          (i.reviewNotes && i.reviewNotes.toLowerCase().includes(query))
        );
      }
    }
    return Promise.resolve(list);
  }

  async getIncidentById(id: string): Promise<SafetyIncident | null> {
    if (this.mode === 'real') return this.request<SafetyIncident>(`/api/incidents/${id}`);
    const found = mockStore.getState().incidents.find(i => i.id === id);
    return Promise.resolve(found || null);
  }

  async addIncidentReview(id: string, dto: AddReviewNoteDTO, reviewerName: string): Promise<SafetyIncident> {
    if (this.mode === 'real') {
      return this.request<SafetyIncident>(`/api/incidents/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    }

    mockStore.updateIncidentReview(id, dto.note, !!dto.markReviewed, reviewerName);
    const updated = mockStore.getState().incidents.find(i => i.id === id);
    if (!updated) throw new Error('Incident not found');
    return Promise.resolve(updated);
  }

  // --- Device Lab ---
  async getDevices(orgId?: string): Promise<MonitoringDevice[]> {
    if (this.mode === 'real') return this.request<MonitoringDevice[]>(`/api/devices${orgId ? `?orgId=${orgId}` : ''}`);
    const devs = mockStore.getState().devices;
    if (orgId) return Promise.resolve(devs.filter(d => d.organizationId === orgId));
    return Promise.resolve([...devs]);
  }

  async getDeviceById(id: string): Promise<MonitoringDevice | null> {
    if (this.mode === 'real') return this.request<MonitoringDevice>(`/api/devices/${id}`);
    const found = mockStore.getState().devices.find(d => d.id === id);
    return Promise.resolve(found || null);
  }

  async getDeviceEvents(deviceId: string): Promise<DetectionEvent[]> {
    if (this.mode === 'real') return this.request<DetectionEvent[]>(`/api/devices/${deviceId}/events`);
    return Promise.resolve(mockStore.getState().events.filter(e => e.deviceId === deviceId));
  }

  async getDeviceSyncJobs(deviceId: string): Promise<SyncJob[]> {
    if (this.mode === 'real') return this.request<SyncJob[]>(`/api/devices/${deviceId}/sync-jobs`);
    return Promise.resolve(mockStore.getState().syncJobs.filter(j => j.deviceId === deviceId));
  }

  async startMonitoring(dto: StartMonitoringSessionDTO): Promise<MonitoringSession> {
    if (this.mode === 'real') {
      return this.request<MonitoringSession>(`/api/devices/${dto.deviceId}/monitoring/start`, {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    }
    const session = mockStore.startSession(dto.deviceId, dto.driverId, dto.vehicleId);
    return Promise.resolve(session);
  }

  async stopMonitoring(sessionId: string): Promise<MonitoringSession> {
    if (this.mode === 'real') {
      return this.request<MonitoringSession>(`/api/monitoring/sessions/${sessionId}/stop`, {
        method: 'POST',
      });
    }
    const session = mockStore.stopSession(sessionId);
    if (!session) throw new Error('Session not found');
    return Promise.resolve(session);
  }

  async triggerSimulatedEvent(
    deviceId: string, 
    category: 'phone_use' | 'prolonged_eye_closure', 
    severity: 'warning' | 'critical'
  ): Promise<DetectionEvent> {
    if (this.mode === 'real') {
      return this.request<DetectionEvent>(`/api/devices/${deviceId}/simulate-event`, {
        method: 'POST',
        body: JSON.stringify({ category, severity }),
      });
    }
    const evt = mockStore.addSimulatedEvent(deviceId, category, severity);
    return Promise.resolve(evt);
  }

  async getAIThresholds(): Promise<AIThresholdConfig> {
    if (this.mode === 'real') return this.request<AIThresholdConfig>('/api/devices/config/thresholds');
    return Promise.resolve({ ...mockStore.getState().thresholds });
  }

  async updateAIThresholds(config: Partial<AIThresholdConfig>): Promise<AIThresholdConfig> {
    if (this.mode === 'real') {
      return this.request<AIThresholdConfig>('/api/devices/config/thresholds', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    }
    const updated = mockStore.updateThresholds(config);
    return Promise.resolve(updated);
  }

  async retrySyncJob(jobId: string): Promise<SyncJob> {
    if (this.mode === 'real') {
      return this.request<SyncJob>(`/api/sync-jobs/${jobId}/retry`, { method: 'POST' });
    }
    const retried = mockStore.retrySync(jobId);
    if (!retried) throw new Error('Sync job not found');
    return Promise.resolve(retried);
  }
}

export const apiClient = new ApiClient();
