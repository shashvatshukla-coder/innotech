// SafeDrive AI - Core Domain Types and Contracts

export type UserRole = 
  | 'admin'      // Platform Administrator
  | 'owner'      // Fleet Owner
  | 'manager'    // Fleet Manager
  | 'reviewer'   // Safety Reviewer
  | 'tester'     // Device Tester / Hardware Engineer
  | 'driver';    // Commercial Driver

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  avatarUrl?: string;
  assignedVehicleId?: string; // For driver role
  assignedDriverId?: string;  // For driver profile link
  lastActive: string;
}

export type CustomerStatus = 'active' | 'trial' | 'past_due' | 'deactivated';
export type AccountType = 'enterprise' | 'growth' | 'starter';
export type SubscriptionPlan = 'starter_fleet' | 'professional_safety' | 'enterprise_ai';
export type BillingCycle = 'monthly' | 'annual';

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  accountType: AccountType;
  registeredVehicles: number;
  plan: SubscriptionPlan;
  status: CustomerStatus;
  createdAt: string;
  renewalDate: string;
  monthlyRevenueINR: number;
  address: {
    city: string;
    state: string;
    pincode: string;
  };
}

export interface Organization {
  id: string;
  customerId: string;
  name: string;
  legalEntity: string;
  industry: string;
  fleetSize: number;
  driverCount: number;
  activeDevicesCount: number;
  plan: SubscriptionPlan;
  accountManager: string;
  contractStatus: 'active' | 'pending_renewal' | 'under_review';
  hqLocation: string;
  createdAt: string;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amountINR: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: InvoiceStatus;
  plan: SubscriptionPlan;
  vehicleCount: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  amountINR: number;
  status: 'active' | 'trial' | 'past_due' | 'cancelled';
  startDate: string;
  renewalDate: string;
  autoRenew: boolean;
  activeVehicles: number;
  maxVehicles: number;
}

export type VehicleStatus = 'active' | 'maintenance' | 'idle' | 'inactive';
export type VehicleType = 'Heavy Truck (16-Wheel)' | 'Heavy Commercial (10-Wheel)' | 'Medium Hauler' | 'Refrigerated Carrier' | 'Tanker Trailer' | 'Express Container';

export interface Vehicle {
  id: string;
  organizationId: string;
  registrationNumber: string; // e.g. MH-12-RN-4821
  makeModel: string;          // e.g. Tata Prima 5530.S
  vehicleType: VehicleType;
  year: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  deviceId?: string;
  deviceStatus: DeviceConnectionState;
  lastSyncAt: string;
  totalIncidentsCount: number;
  status: VehicleStatus;
  depotLocation: string;
}

export type DriverMonitoringStatus = 'active' | 'idle' | 'off_duty' | 'suspended';

export interface Driver {
  id: string;
  organizationId: string;
  fullName: string;
  licenseNumber: string; // e.g. DL-0420180029348
  phone: string;
  email: string;
  assignedVehicleId?: string;
  assignedVehicleReg?: string;
  totalMonitoredHours: number;
  totalSessionsCount: number;
  warningEventsCount: number;
  criticalIncidentsCount: number;
  lastActiveAt: string;
  currentStatus: DriverMonitoringStatus;
  joinedDate: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export type DeviceCameraState = 'active' | 'degraded' | 'disconnected';
export type DeviceAiState = 'running' | 'calibrating' | 'model_error' | 'offline';
export type DeviceConnectionState = 'online' | 'intermittent' | 'offline';

export interface DeviceHealth {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  temperatureCelsius: number;
  fps: number;
  yoloModelLoaded: boolean;
  mediaPipeLoaded: boolean;
  lastInferenceMs: number;
  storageFreeGb: number;
  queueDepth: number;
}

export interface MonitoringDevice {
  id: string; // e.g. DEV-IND-091
  organizationId: string;
  name: string;
  hardwareSerial: string;
  firmwareVersion: string;
  assignedVehicleId?: string;
  assignedVehicleReg?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  cameraState: DeviceCameraState;
  aiModelState: DeviceAiState;
  connectionState: DeviceConnectionState;
  lastHeartbeatAt: string;
  lastSyncAt: string;
  currentSessionId?: string;
  health: DeviceHealth;
  lastError?: string;
  isSimulated?: boolean;
}

export type SessionState = 'active' | 'completed' | 'paused' | 'aborted';

export interface MonitoringSession {
  id: string;
  deviceId: string;
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  state: SessionState;
  eventCount: number;
  warningsCount: number;
  criticalCount: number;
  avgEAR: number; // Eye Aspect Ratio baseline
  isSimulated?: boolean;
}

export type IncidentCategory = 
  | 'drowsiness'
  | 'prolonged_eye_closure'
  | 'phone_use'
  | 'distracted_posture'
  | 'driver_unresponsive'
  | 'sync_failure';

export type IncidentSeverity = 'safe' | 'warning' | 'critical';

export type IncidentReviewStatus = 
  | 'pending'
  | 'under_review'
  | 'reviewed'
  | 'escalated'
  | 'dismissed';

export type EvidenceStatus = 
  | 'ready'
  | 'processing'
  | 'upload_pending'
  | 'upload_failed'
  | 'unavailable'
  | 'corrupted';

export interface EvidenceClip {
  clipId: string;
  status: EvidenceStatus;
  durationSeconds: number;
  fileSizeBytes?: number;
  resolution?: string;
  mediaUrl?: string; // Transcoded web-compatible MP4 / HLS stream URL
  rawLocalPath?: string; // Internal edge device path (e.g. alerts_evidence/alert_clip_102.avi)
  capturedAt: string;
  uploadedAt?: string;
  failureReason?: string;
  storageBucket?: string;
}

export interface SafetyIncident {
  id: string; // e.g. INC-2026-8812
  organizationId: string;
  timestamp: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleReg: string;
  deviceId: string;
  sessionId: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  durationSeconds: number;
  confidence?: number; // 0.0 to 1.0 (only present if model output provides confidence)
  detectionSource: 'YOLOv8 Phone Detector' | 'MediaPipe EAR Eye Mesh' | 'Head Pose Inclinometer' | 'Edge Watchdog';
  evidenceStatus: EvidenceStatus;
  evidenceClip?: EvidenceClip;
  reviewStatus: IncidentReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  auditTrail: AuditLog[];
  audioAnnouncedHindi: boolean;
  audioAnnouncedText?: string;
}

export interface DetectionEvent {
  id: string;
  deviceId: string;
  sessionId: string;
  timestamp: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  durationSeconds: number;
  confidence?: number;
  audioAnnouncementPlayed: boolean;
  audioText?: string;
  evidenceRecorded: boolean;
  evidenceClipId?: string;
  uploadStatus: 'pending' | 'uploading' | 'synced' | 'failed';
  errorMessage?: string;
}

export interface SyncJob {
  id: string;
  deviceId: string;
  vehicleReg: string;
  type: 'telemetry_batch' | 'incident_metadata' | 'evidence_video_avi_mp4' | 'diagnostics';
  status: 'completed' | 'queued' | 'in_progress' | 'failed';
  queuedAt: string;
  syncedAt?: string;
  bytesTotal: number;
  bytesTransferred: number;
  retryCount: number;
  error?: string;
}

export interface AuditLog {
  id: string;
  incidentId: string;
  action: 'created' | 'note_added' | 'marked_reviewed' | 'escalated' | 'evidence_accessed';
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  details: string;
}

export interface ReportFilter {
  startDate: string;
  endDate: string;
  organizationId?: string;
  driverId?: string;
  vehicleId?: string;
  category?: IncidentCategory | 'all';
  severity?: IncidentSeverity | 'all';
  reviewStatus?: IncidentReviewStatus | 'all';
  searchQuery?: string;
}

export interface AIThresholdConfig {
  warningThresholdSeconds: number; // default 5s
  criticalThresholdSeconds: number; // default 10s
  audioCooldownSeconds: number;    // default 4s
  evidenceClipDurationSeconds: number; // default 10s
  earClosureThreshold: number;     // e.g. 0.22
  headPosePitchToleranceDeg: number; // e.g. 25 deg
}
