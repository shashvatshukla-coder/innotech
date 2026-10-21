// SafeDrive AI - Edge Hardware Device Client Interface & Adapter
// Communicates with either local Python daemon or in-memory simulated bench

import { MonitoringDevice, MonitoringSession, DetectionEvent, AIThresholdConfig } from '../../types';
import { mockStore } from '../mock/mock-store';

export interface IDeviceClient {
  isLocalDaemonAvailable(): Promise<boolean>;
  getDeviceStatus(deviceId: string): Promise<MonitoringDevice>;
  getRecentEvents(deviceId: string): Promise<DetectionEvent[]>;
  startSession(deviceId: string, driverId: string, vehicleId: string): Promise<MonitoringSession>;
  stopSession(sessionId: string): Promise<MonitoringSession>;
  getThresholds(): Promise<AIThresholdConfig>;
  updateThresholds(thresholds: Partial<AIThresholdConfig>): Promise<AIThresholdConfig>;
  triggerSimulatedViolation(deviceId: string, category: 'phone_use' | 'prolonged_eye_closure', severity: 'warning' | 'critical'): Promise<DetectionEvent>;
}

export class DeviceClient implements IDeviceClient {
  private localServiceUrl: string;

  constructor() {
    this.localServiceUrl = import.meta.env.VITE_DEVICE_SERVICE_URL || 'http://127.0.0.1:8000';
  }

  async isLocalDaemonAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${this.localServiceUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false; // Local Python edge daemon not running on port 8000
    }
  }

  async getDeviceStatus(deviceId: string): Promise<MonitoringDevice> {
    const dev = mockStore.getState().devices.find(d => d.id === deviceId);
    if (!dev) throw new Error(`Device ${deviceId} not found`);
    return dev;
  }

  async getRecentEvents(deviceId: string): Promise<DetectionEvent[]> {
    return mockStore.getState().events.filter(e => e.deviceId === deviceId);
  }

  async startSession(deviceId: string, driverId: string, vehicleId: string): Promise<MonitoringSession> {
    return mockStore.startSession(deviceId, driverId, vehicleId);
  }

  async stopSession(sessionId: string): Promise<MonitoringSession> {
    const stopped = mockStore.stopSession(sessionId);
    if (!stopped) throw new Error('Session not found or already stopped');
    return stopped;
  }

  async getThresholds(): Promise<AIThresholdConfig> {
    return mockStore.getState().thresholds;
  }

  async updateThresholds(thresholds: Partial<AIThresholdConfig>): Promise<AIThresholdConfig> {
    return mockStore.updateThresholds(thresholds);
  }

  async triggerSimulatedViolation(
    deviceId: string, 
    category: 'phone_use' | 'prolonged_eye_closure', 
    severity: 'warning' | 'critical'
  ): Promise<DetectionEvent> {
    return mockStore.addSimulatedEvent(deviceId, category, severity);
  }
}

export const deviceClient = new DeviceClient();
