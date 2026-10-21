// SafeDrive AI - In-Session Mock State Store
// Backed by localStorage with full relational consistency and state subscriptions

import { 
  Customer, 
  Organization, 
  Subscription, 
  Invoice, 
  Vehicle, 
  Driver, 
  MonitoringDevice, 
  SafetyIncident, 
  DetectionEvent, 
  MonitoringSession,
  SyncJob,
  AIThresholdConfig
} from '../../types';
import { 
  SEED_CUSTOMERS, 
  SEED_ORGANIZATIONS, 
  SEED_SUBSCRIPTIONS, 
  SEED_INVOICES, 
  SEED_VEHICLES, 
  SEED_DRIVERS, 
  SEED_DEVICES, 
  SEED_INCIDENTS, 
  SEED_DETECTION_EVENTS, 
  SEED_SESSIONS, 
  SEED_SYNC_JOBS 
} from './seed-data';
import { DESIGN_TOKENS } from '../../constants/tokens';

const STORAGE_KEY = 'safedrive_mock_state_v1';

export interface MockState {
  customers: Customer[];
  organizations: Organization[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  vehicles: Vehicle[];
  drivers: Driver[];
  devices: MonitoringDevice[];
  incidents: SafetyIncident[];
  events: DetectionEvent[];
  sessions: MonitoringSession[];
  syncJobs: SyncJob[];
  thresholds: AIThresholdConfig;
}

class MockStore {
  private state: MockState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): MockState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load mock state from storage:', e);
    }

    return {
      customers: [...SEED_CUSTOMERS],
      organizations: [...SEED_ORGANIZATIONS],
      subscriptions: [...SEED_SUBSCRIPTIONS],
      invoices: [...SEED_INVOICES],
      vehicles: [...SEED_VEHICLES],
      drivers: [...SEED_DRIVERS],
      devices: [...SEED_DEVICES],
      incidents: [...SEED_INCIDENTS],
      events: [...SEED_DETECTION_EVENTS],
      sessions: [...SEED_SESSIONS],
      syncJobs: [...SEED_SYNC_JOBS],
      thresholds: { ...DESIGN_TOKENS.defaultThresholds },
    };
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to persist mock state to storage:', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (err) { console.error('Error in mock store listener', err); }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): MockState {
    return this.state;
  }

  public resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      customers: [...SEED_CUSTOMERS],
      organizations: [...SEED_ORGANIZATIONS],
      subscriptions: [...SEED_SUBSCRIPTIONS],
      invoices: [...SEED_INVOICES],
      vehicles: [...SEED_VEHICLES],
      drivers: [...SEED_DRIVERS],
      devices: [...SEED_DEVICES],
      incidents: [...SEED_INCIDENTS],
      events: [...SEED_DETECTION_EVENTS],
      sessions: [...SEED_SESSIONS],
      syncJobs: [...SEED_SYNC_JOBS],
      thresholds: { ...DESIGN_TOKENS.defaultThresholds },
    };
    this.persist();
  }

  // Customers (Admin)
  public addCustomer(newCust: Customer, newOrg?: Organization, newSub?: Subscription) {
    this.state.customers = [newCust, ...this.state.customers];
    if (newOrg) {
      this.state.organizations = [newOrg, ...this.state.organizations];
    }
    if (newSub) {
      this.state.subscriptions = [newSub, ...this.state.subscriptions];
    }
    this.persist();
  }

  public updateCustomer(id: string, updates: Partial<Customer>) {
    this.state.customers = this.state.customers.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    this.persist();
  }

  public deactivateCustomer(id: string) {
    this.state.customers = this.state.customers.map(c => 
      c.id === id ? { ...c, status: 'deactivated' } : c
    );
    this.state.subscriptions = this.state.subscriptions.map(s => 
      s.customerId === id ? { ...s, status: 'cancelled' } : s
    );
    this.persist();
  }

  // Vehicles (Fleet)
  public addVehicle(vehicle: Vehicle) {
    this.state.vehicles = [vehicle, ...this.state.vehicles];
    this.persist();
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>) {
    this.state.vehicles = this.state.vehicles.map(v => 
      v.id === id ? { ...v, ...updates } : v
    );
    this.persist();
  }

  // Incidents
  public updateIncidentReview(
    incidentId: string, 
    reviewNotes: string, 
    markReviewed: boolean, 
    actorName: string
  ) {
    this.state.incidents = this.state.incidents.map(inc => {
      if (inc.id !== incidentId) return inc;
      const updatedAudit = [
        ...inc.auditTrail,
        {
          id: `AUD-${Date.now()}`,
          incidentId,
          action: markReviewed ? 'marked_reviewed' : 'note_added',
          actorId: 'USR-CURRENT',
          actorName,
          actorRole: 'reviewer',
          timestamp: new Date().toISOString(),
          details: markReviewed 
            ? `Marked as reviewed with note: ${reviewNotes}`
            : `Added review note: ${reviewNotes}`,
        } as const,
      ];

      return {
        ...inc,
        reviewStatus: markReviewed ? 'reviewed' : 'under_review',
        reviewNotes: reviewNotes || inc.reviewNotes,
        reviewedBy: markReviewed ? actorName : inc.reviewedBy,
        reviewedAt: markReviewed ? new Date().toISOString() : inc.reviewedAt,
        auditTrail: updatedAudit,
      };
    });
    this.persist();
  }

  // Device Lab
  public startSession(deviceId: string, driverId: string, vehicleId: string): MonitoringSession {
    const driver = this.state.drivers.find(d => d.id === driverId);
    const vehicle = this.state.vehicles.find(v => v.id === vehicleId);
    const newSession: MonitoringSession = {
      id: `SES-SIM-${Date.now()}`,
      deviceId,
      vehicleId,
      vehicleReg: vehicle?.registrationNumber || 'MH-12-RN-4821',
      driverId,
      driverName: driver?.fullName || 'Demo Driver',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      state: 'active',
      eventCount: 0,
      warningsCount: 0,
      criticalCount: 0,
      avgEAR: 0.28,
      isSimulated: true,
    };

    this.state.sessions = [newSession, ...this.state.sessions];
    this.state.devices = this.state.devices.map(d => 
      d.id === deviceId ? { ...d, currentSessionId: newSession.id, aiModelState: 'running', cameraState: 'active' } : d
    );
    this.persist();
    return newSession;
  }

  public stopSession(sessionId: string): MonitoringSession | null {
    let stoppedSession: MonitoringSession | null = null;
    this.state.sessions = this.state.sessions.map(s => {
      if (s.id === sessionId) {
        stoppedSession = {
          ...s,
          state: 'completed',
          endedAt: new Date().toISOString(),
        };
        return stoppedSession;
      }
      return s;
    });

    if (stoppedSession) {
      this.state.devices = this.state.devices.map(d => 
        d.currentSessionId === sessionId ? { ...d, currentSessionId: undefined } : d
      );
      this.persist();
    }
    return stoppedSession;
  }

  public addSimulatedEvent(
    deviceId: string, 
    category: 'phone_use' | 'prolonged_eye_closure', 
    severity: 'warning' | 'critical'
  ): DetectionEvent {
    const dev = this.state.devices.find(d => d.id === deviceId);
    const sessionId = dev?.currentSessionId || 'SES-LAB-BENCH-01';
    const isPhone = category === 'phone_use';
    const duration = severity === 'critical' ? 10.8 : 5.8;
    const confidence = isPhone ? 0.92 : undefined;

    const newEvt: DetectionEvent = {
      id: `EVT-SIM-${Date.now().toString().slice(-4)}`,
      deviceId,
      sessionId,
      timestamp: new Date().toISOString(),
      category,
      severity,
      durationSeconds: duration,
      confidence,
      audioAnnouncementPlayed: true,
      audioText: isPhone 
        ? 'कृपया वाहन चलाते समय फोन का उपयोग न करें।' 
        : 'चेतावनी: गंभीर झपकी का पता चला। वाहन रोकें।',
      evidenceRecorded: true,
      evidenceClipId: `CLIP-SIM-${Date.now().toString().slice(-4)}`,
      uploadStatus: 'synced',
    };

    this.state.events = [newEvt, ...this.state.events];

    // Create a corresponding safety incident
    const newInc: SafetyIncident = {
      id: `INC-SIM-${Date.now().toString().slice(-4)}`,
      organizationId: dev?.organizationId || 'ORG-BHARAT-01',
      timestamp: newEvt.timestamp,
      driverId: dev?.assignedDriverId || 'DRV-001',
      driverName: dev?.assignedDriverName || 'Rameshwar Yadav (Sim)',
      vehicleId: dev?.assignedVehicleId || 'VEH-MH-12-4821',
      vehicleReg: dev?.assignedVehicleReg || 'MH-12-RN-4821 (Bench Sim)',
      deviceId,
      sessionId,
      category,
      severity,
      durationSeconds: duration,
      confidence,
      detectionSource: isPhone ? 'YOLOv8 Phone Detector' : 'MediaPipe EAR Eye Mesh',
      evidenceStatus: 'ready',
      evidenceClip: {
        clipId: newEvt.evidenceClipId!,
        status: 'ready',
        durationSeconds: 10,
        fileSizeBytes: 4200000,
        resolution: '1280x720 @ 30fps',
        mediaUrl: isPhone 
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' 
          : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        rawLocalPath: `alerts_evidence/sim_${newEvt.id}.avi`,
        capturedAt: newEvt.timestamp,
        uploadedAt: newEvt.timestamp,
      },
      reviewStatus: 'pending',
      audioAnnouncedHindi: true,
      audioAnnouncedText: newEvt.audioText,
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          incidentId: `INC-SIM-${Date.now().toString().slice(-4)}`,
          action: 'created',
          actorId: deviceId,
          actorName: dev?.name || 'Simulation Engine',
          actorRole: 'tester',
          timestamp: newEvt.timestamp,
          details: `Simulated ${severity} ${category} trigger recorded in lab session.`,
        },
      ],
    };

    this.state.incidents = [newInc, ...this.state.incidents];

    // Update active session event counts
    this.state.sessions = this.state.sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          eventCount: s.eventCount + 1,
          warningsCount: severity === 'warning' ? s.warningsCount + 1 : s.warningsCount,
          criticalCount: severity === 'critical' ? s.criticalCount + 1 : s.criticalCount,
        };
      }
      return s;
    });

    this.persist();
    return newEvt;
  }

  public updateThresholds(config: Partial<AIThresholdConfig>): AIThresholdConfig {
    this.state.thresholds = { ...this.state.thresholds, ...config };
    this.persist();
    return this.state.thresholds;
  }

  public retrySync(jobId: string): SyncJob | null {
    let retried: SyncJob | null = null;
    this.state.syncJobs = this.state.syncJobs.map(job => {
      if (job.id === jobId) {
        retried = {
          ...job,
          status: 'completed',
          syncedAt: new Date().toISOString(),
          bytesTransferred: job.bytesTotal,
          error: undefined,
        };
        return retried;
      }
      return job;
    });
    if (retried) this.persist();
    return retried;
  }
}

export const mockStore = new MockStore();
