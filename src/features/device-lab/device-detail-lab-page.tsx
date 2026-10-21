import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Camera, 
  CameraOff, 
  AlertTriangle, 
  ShieldAlert, 
  Volume2, 
  Sliders, 
  Activity, 
  Cpu, 
  RefreshCw,
  CheckCircle2,
  PhoneCall,
  Eye,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { PipelineVisualizer, PipelineStep } from '../../components/devices/pipeline-visualizer';
import { mockStore } from '../../services/mock/mock-store';
import { deviceClient } from '../../services/device/device-client';
import { MonitoringDevice, MonitoringSession, DetectionEvent, AIThresholdConfig } from '../../types';
import { formatDuration, formatDateTime, formatCategoryName } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const DeviceDetailLabPage: React.FC = () => {
  const { id = 'DEV-LAB-TESTER' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<MonitoringDevice | null>(null);
  const [session, setSession] = useState<MonitoringSession | null>(null);
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [thresholds, setThresholds] = useState<AIThresholdConfig>(mockStore.getState().thresholds);

  // Live video mode: 'webcam' | 'simulated' | 'off'
  const [cameraMode, setCameraMode] = useState<'webcam' | 'simulated' | 'off'>('simulated');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Session elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Pipeline state
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: 1, label: '1. Local Edge Detection', sublabel: 'YOLOv8 & MediaPipe EAR', status: 'completed' },
    { id: 2, label: '2. Cab Hindi Audio Alert', sublabel: 'gTTS & playsound', status: 'completed' },
    { id: 3, label: '3. Evidence Video Buffer', sublabel: '10s loop clip (.avi)', status: 'completed' },
    { id: 4, label: '4. Metadata Packaging', sublabel: 'Device & Driver telemetry', status: 'completed' },
    { id: 5, label: '5. Ingest API Submission', sublabel: 'REST HTTPS POST', status: 'completed' },
    { id: 6, label: '6. Storage & Transcoding', sublabel: 'S3 & ffmpeg MP4 conversion', status: 'completed' },
    { id: 7, label: '7. Database Acknowledgment', sublabel: 'ACID PostgreSQL insert', status: 'completed' },
    { id: 8, label: '8. Fleet Sync & Review Queue', sublabel: 'WebSocket dispatch', status: 'completed' },
  ]);

  // Audio Speech Synthesis state
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(true);

  // Threshold form edit state
  const [editWarningSec, setEditWarningSec] = useState(5);
  const [editCriticalSec, setEditCriticalSec] = useState(10);
  const [editCooldownSec, setEditCooldownSec] = useState(4);
  const [editClipDurationSec, setEditClipDurationSec] = useState(10);
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    const updateLocalState = () => {
      const dev = mockStore.getState().devices.find(d => d.id === id) || mockStore.getState().devices[0];
      setDevice(dev);
      if (dev.currentSessionId) {
        const ses = mockStore.getState().sessions.find(s => s.id === dev.currentSessionId);
        setSession(ses || null);
      } else {
        setSession(null);
      }
      setEvents(mockStore.getState().events.filter(e => e.deviceId === dev.id));
      const curThresholds = mockStore.getState().thresholds;
      setThresholds(curThresholds);
      setEditWarningSec(curThresholds.warningThresholdSeconds);
      setEditCriticalSec(curThresholds.criticalThresholdSeconds);
      setEditCooldownSec(curThresholds.audioCooldownSeconds);
      setEditClipDurationSec(curThresholds.evidenceClipDurationSeconds);
    };

    updateLocalState();
    return mockStore.subscribe(updateLocalState);
  }, [id]);

  // Session timer ticker
  useEffect(() => {
    let interval: any = null;
    if (session && session.state === 'active') {
      const started = new Date(session.startedAt).getTime();
      interval = setInterval(() => {
        const now = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((now - started) / 1000)));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [session]);

  // Start real browser webcam if requested
  const handleToggleWebcam = async () => {
    if (isWebcamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsWebcamActive(false);
      setCameraMode('simulated');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsWebcamActive(true);
        setCameraMode('webcam');
      } catch (err) {
        alert('Could not access local webcam. Please check browser camera permissions or continue with Simulation Feed.');
      }
    }
  };

  const handleStartSession = async () => {
    if (!device) return;
    const newSession = await deviceClient.startSession(
      device.id,
      device.assignedDriverId || 'DRV-001',
      device.assignedVehicleId || 'VEH-MH-12-4821'
    );
    setSession(newSession);
  };

  const handleStopSession = async () => {
    if (!session) return;
    await deviceClient.stopSession(session.id);
    setSession(null);
  };

  const speakAlert = (text: string) => {
    if (!speechSynthesisEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Speak in Hindi if available
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not allowed by browser interaction:', e);
    }
  };

  const handleTriggerSimulated = async (category: 'phone_use' | 'prolonged_eye_closure', severity: 'warning' | 'critical') => {
    if (!device) return;

    // Speak audio announcement
    const textToSpeak = category === 'phone_use'
      ? 'कृपया वाहन चलाते समय मोबाइल फोन का उपयोग न करें।'
      : 'चेतावनी: गंभीर झपकी का पता चला। कृपया वाहन तुरंत रोकें।';
    speakAlert(textToSpeak);

    // Update pipeline animation steps
    setPipelineSteps(prev => [
      { id: 1, label: '1. Local Edge Detection', sublabel: category === 'phone_use' ? 'YOLOv8 Phone Confirmed' : 'MediaPipe EAR < 0.22', status: 'completed' },
      { id: 2, label: '2. Cab Hindi Audio Alert', sublabel: 'gTTS speech played in cab', status: 'completed' },
      { id: 3, label: '3. Evidence Video Buffer', sublabel: '10s pre-trigger buffer (.avi)', status: 'processing' },
      { id: 4, label: '4. Metadata Packaging', sublabel: 'Telemetry bundle prepared', status: 'processing' },
      { id: 5, label: '5. Ingest API Submission', sublabel: 'Pushing to cloud ingest', status: 'pending' },
      { id: 6, label: '6. Storage & Transcoding', sublabel: 'ffmpeg avi -> mp4 conversion', status: 'pending' },
      { id: 7, label: '7. Database Acknowledgment', sublabel: 'PostgreSQL record commit', status: 'pending' },
      { id: 8, label: '8. Fleet Sync & Review Queue', sublabel: 'Live dispatch to fleet owner', status: 'pending' },
    ]);

    setTimeout(() => {
      setPipelineSteps(prev => prev.map(s => s.id <= 5 ? { ...s, status: 'completed' } : { ...s, status: 'processing' }));
    }, 600);

    setTimeout(() => {
      setPipelineSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
    }, 1200);

    await deviceClient.triggerSimulatedViolation(device.id, category, severity);
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    await deviceClient.updateThresholds({
      warningThresholdSeconds: Number(editWarningSec),
      criticalThresholdSeconds: Number(editCriticalSec),
      audioCooldownSeconds: Number(editCooldownSec),
      evidenceClipDurationSeconds: Number(editClipDurationSec),
    });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  if (!device) return null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.LAB.DEVICES)} className="h-8 px-2.5">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Hardware Lab</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold font-mono text-slate-900 tracking-tight flex items-center gap-2">
              <span>{device.name}</span>
              <span className="text-xs font-mono font-medium text-brand-700">({device.id})</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Firmware: {device.firmwareVersion} • Serial: {device.hardwareSerial} • Protocol: WebSocket/REST v2.4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session && session.state === 'active' ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-300 rounded text-xs font-mono text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE SESSION: {formatDuration(elapsedSeconds)}</span>
            </div>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200">
              Session Inactive
            </span>
          )}

          {session && session.state === 'active' ? (
            <Button variant="danger" size="sm" onClick={handleStopSession} className="gap-1.5 h-8">
              <Square className="w-3.5 h-3.5" />
              <span>Stop Session</span>
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleStartSession} className="gap-1.5 h-8 shadow-sm">
              <Play className="w-3.5 h-3.5" />
              <span>Start Monitoring Session</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Video Stream with Live HUD + Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Central Camera Video Viewport with HUD overlay */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none" className="overflow-hidden bg-slate-950 border-slate-800">
            {/* Viewport Top Bar */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-slate-200">Optical Edge Sensor Stream</span>
                {cameraMode === 'webcam' ? (
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-mono">
                    Live Browser Webcam Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-brand-950 text-brand-300 border border-brand-800 rounded text-[10px] font-mono">
                    Simulated In-Cab Loop
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleWebcam}
                  className="h-7 text-[11px] gap-1.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isWebcamActive ? 'Disable Webcam' : 'Enable Real Webcam'}</span>
                </Button>
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {isWebcamActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  className="w-full h-full object-cover opacity-85"
                />
              )}

              {/* HUD Telemetry Overlay on Video Feed */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                <div className="px-2 py-1 bg-black/75 backdrop-blur-xs rounded border border-white/10 text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>DRIVER DETECTED: YES (Face Mesh 468 pts)</span>
                </div>

                <div className="px-2 py-1 bg-black/75 backdrop-blur-xs rounded border border-white/10 text-[11px] font-mono text-slate-200 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>EAR (Eye Aspect Ratio): 0.28 (Threshold: {thresholds.earClosureThreshold})</span>
                </div>

                <div className="px-2 py-1 bg-black/75 backdrop-blur-xs rounded border border-white/10 text-[11px] font-mono text-slate-200 flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>YOLOv8 Phone Detector: Active (0 objects)</span>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-xs rounded border border-white/10 text-[11px] font-mono text-slate-300">
                1280x720 @ {device.health.fps.toFixed(1)} FPS • {device.health.lastInferenceMs}ms
              </div>
            </div>

            {/* Telemetry Status Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-3">
                <span>YOLOv8: <strong className="text-emerald-400">Loaded</strong></span>
                <span>MediaPipe: <strong className="text-emerald-400">Active</strong></span>
                <span>Audio Cooldown: <strong className="text-slate-200 font-mono">{thresholds.audioCooldownSeconds}s</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="speechToggle"
                  checked={speechSynthesisEnabled}
                  onChange={e => setSpeechSynthesisEnabled(e.target.checked)}
                  className="rounded border-slate-700 text-brand-600 focus:ring-0 h-3.5 w-3.5"
                />
                <label htmlFor="speechToggle" className="text-[11px] text-slate-300 cursor-pointer flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-brand-400" />
                  <span>Spoken Hindi Cab Alerts (Web Speech)</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Interactive Trigger Test Bench */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Interactive AI Anomaly & Violation Injector</CardTitle>
                <CardDescription>
                  Trigger verified edge detection states to validate cab audio announcements, buffer packaging, and cloud ingestion.
                </CardDescription>
              </div>
              <Badge variant="blue" withDot={false}>Test Rig</Badge>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Trigger Warning Alert (Phone Detected)</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Simulates YOLOv8 phone detection exceeding {thresholds.warningThresholdSeconds}s warning threshold. Plays cab audio reminder in Hindi.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTriggerSimulated('phone_use', 'warning')}
                  className="mt-3 border-amber-300 text-amber-900 bg-white hover:bg-amber-100/50 text-xs gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Inject Phone Warning</span>
                </Button>
              </div>

              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Trigger Critical Event (Prolonged Eye Closure)</span>
                  </div>
                  <p className="text-[11px] text-rose-800">
                    Simulates MediaPipe Eye Aspect Ratio dropping &lt; 0.22 for &gt; {thresholds.criticalThresholdSeconds}s. Mandates immediate cab voice alert and clip buffer.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleTriggerSimulated('prolonged_eye_closure', 'critical')}
                  className="mt-3 text-xs gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inject Critical Fatigue</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* 8-Stage Pipeline Visualizer */}
          <PipelineVisualizer steps={pipelineSteps} />
        </div>

        {/* Right Sidebar: Threshold Configuration & Edge Health Diagnostics */}
        <div className="space-y-5">
          {/* Edge Hardware Health Gauges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Edge Hardware Telemetry</CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">CPU Core Utilization:</span>
                  <span className="font-mono font-semibold text-slate-900">{device.health.cpuUsagePercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${device.health.cpuUsagePercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">RAM Allocation:</span>
                  <span className="font-mono font-semibold text-slate-900">{device.health.memoryUsagePercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${device.health.memoryUsagePercent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-500 block">Temperature</span>
                  <span className="font-mono font-bold text-slate-800">{device.health.temperatureCelsius}°C</span>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-500 block">Flash Storage</span>
                  <span className="font-mono font-bold text-slate-800">{device.health.storageFreeGb} GB Free</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Threshold Configuration Form */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>AI Threshold Calibration</CardTitle>
                <CardDescription>Live parameters applied to local detection heuristics</CardDescription>
              </div>
            </CardHeader>

            <form onSubmit={handleSaveThresholds} className="space-y-3 text-xs">
              <Input
                label="Warning Threshold (seconds)"
                type="number"
                value={editWarningSec}
                onChange={e => setEditWarningSec(Number(e.target.value))}
                helperText="Seconds of continuous distraction/phone use before warning chime."
              />

              <Input
                label="Critical Fatigue Threshold (seconds)"
                type="number"
                value={editCriticalSec}
                onChange={e => setEditCriticalSec(Number(e.target.value))}
                helperText="Seconds of prolonged eye closure before mandatory critical cab alarm."
              />

              <Input
                label="Audio Cooldown Period (seconds)"
                type="number"
                value={editCooldownSec}
                onChange={e => setEditCooldownSec(Number(e.target.value))}
                helperText="Minimum gap between repeated voice alert plays."
              />

              <Input
                label="Evidence Clip Buffer (seconds)"
                type="number"
                value={editClipDurationSec}
                onChange={e => setEditClipDurationSec(Number(e.target.value))}
                helperText="Length of recorded video segment around violation."
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" size="sm" className="w-full">
                  Update Detection Thresholds
                </Button>
                {configSaved && (
                  <p className="text-[11px] text-emerald-700 font-semibold text-center mt-1.5">
                    Thresholds updated in local session.
                  </p>
                )}
              </div>
            </form>
          </Card>

          {/* Recent Events List on this Device */}
          <Card padding="none">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Device Event Stream</span>
              <span className="text-slate-400 font-mono text-[11px]">{events.length} logged</span>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {events.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  No detection events recorded for this device.
                </div>
              ) : (
                events.slice(0, 6).map(evt => (
                  <div key={evt.id} className="p-2.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-medium text-brand-700 text-[11px]">{evt.id}</span>
                      <Badge variant={evt.severity === 'critical' ? 'critical' : 'warning'}>
                        {evt.severity}
                      </Badge>
                    </div>
                    <div className="font-medium text-slate-900">{formatCategoryName(evt.category)}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {formatDateTime(evt.timestamp)} • Duration: {evt.durationSeconds}s
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
