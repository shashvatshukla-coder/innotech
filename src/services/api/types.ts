// SafeDrive AI - API Client Interface Contracts

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

export interface CreateCustomerDTO {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  accountType: 'enterprise' | 'growth' | 'starter';
  registeredVehicles: number;
  plan: 'starter_fleet' | 'professional_safety' | 'enterprise_ai';
  city: string;
  state: string;
  pincode: string;
}

export interface UpdateCustomerDTO {
  contactPerson?: string;
  email?: string;
  phone?: string;
  registeredVehicles?: number;
  plan?: 'starter_fleet' | 'professional_safety' | 'enterprise_ai';
  status?: 'active' | 'trial' | 'past_due' | 'deactivated';
}

export interface RegisterVehicleDTO {
  organizationId: string;
  registrationNumber: string;
  makeModel: string;
  vehicleType: 'Heavy Truck (16-Wheel)' | 'Heavy Commercial (10-Wheel)' | 'Medium Hauler' | 'Refrigerated Carrier' | 'Tanker Trailer' | 'Express Container';
  year: number;
  assignedDriverId?: string;
  deviceId?: string;
  depotLocation: string;
}

export interface AddReviewNoteDTO {
  note: string;
  markReviewed?: boolean;
}

export interface DeviceStatusDTO {
  device: MonitoringDevice;
  activeSession?: MonitoringSession;
  recentEvents: DetectionEvent[];
}

export interface StartMonitoringSessionDTO {
  deviceId: string;
  driverId: string;
  vehicleId: string;
}

export interface IApiClient {
  // Mode flag
  isDemoMode(): boolean;

  // Customers (Admin)
  getCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | null>;
  createCustomer(dto: CreateCustomerDTO): Promise<Customer>;
  updateCustomer(id: string, dto: UpdateCustomerDTO): Promise<Customer>;
  deactivateCustomer(id: string): Promise<Customer>;

  // Organizations & Sales (Admin)
  getOrganizations(): Promise<Organization[]>;
  getOrganizationById(id: string): Promise<Organization | null>;
  getSubscriptions(): Promise<Subscription[]>;
  getInvoices(): Promise<Invoice[]>;

  // Fleet (Owner)
  getVehicles(orgId?: string): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | null>;
  registerVehicle(dto: RegisterVehicleDTO): Promise<Vehicle>;
  getDrivers(orgId?: string): Promise<Driver[]>;
  getDriverById(id: string): Promise<Driver | null>;

  // Incidents & Evidence
  getIncidents(filter?: ReportFilter): Promise<SafetyIncident[]>;
  getIncidentById(id: string): Promise<SafetyIncident | null>;
  addIncidentReview(id: string, dto: AddReviewNoteDTO, reviewerName: string): Promise<SafetyIncident>;

  // Device Lab
  getDevices(orgId?: string): Promise<MonitoringDevice[]>;
  getDeviceById(id: string): Promise<MonitoringDevice | null>;
  getDeviceEvents(deviceId: string): Promise<DetectionEvent[]>;
  getDeviceSyncJobs(deviceId: string): Promise<SyncJob[]>;
  startMonitoring(dto: StartMonitoringSessionDTO): Promise<MonitoringSession>;
  stopMonitoring(sessionId: string): Promise<MonitoringSession>;
  triggerSimulatedEvent(deviceId: string, category: 'phone_use' | 'prolonged_eye_closure', severity: 'warning' | 'critical'): Promise<DetectionEvent>;
  getAIThresholds(): Promise<AIThresholdConfig>;
  updateAIThresholds(config: Partial<AIThresholdConfig>): Promise<AIThresholdConfig>;
  retrySyncJob(jobId: string): Promise<SyncJob>;
}
