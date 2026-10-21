import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Clock, 
  User, 
  Truck, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  FileText,
  ShieldCheck,
  History
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { VideoPlayer } from '../../components/evidence/video-player';
import { IncidentReviewModal } from './incident-review-modal';
import { mockStore } from '../../services/mock/mock-store';
import { apiClient } from '../../services/api/client';
import { SafetyIncident } from '../../types';
import { formatDateTime, formatCategoryName, formatSeverityName, formatBytes } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<SafetyIncident | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    const found = mockStore.getState().incidents.find(i => i.id === id);
    if (found) setIncident(found);
  }, [id]);

  useEffect(() => {
    return mockStore.subscribe(() => {
      const found = mockStore.getState().incidents.find(i => i.id === id);
      if (found) setIncident(found);
    });
  }, [id]);

  if (!incident) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-800">Safety Incident Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No violation record found matching identifier {id}.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.INCIDENTS)} className="mt-4">
          Return to Incidents
        </Button>
      </div>
    );
  }

  const handleReviewSubmit = async (note: string, markReviewed: boolean) => {
    await apiClient.addIncidentReview(incident.id, { note, markReviewed }, 'Safety Reviewer');
    setIsReviewOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.OWNER.INCIDENTS)} className="h-8 px-2.5">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Incidents</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-900 tracking-tight">
                {incident.id}
              </h1>
              <Badge variant={incident.severity === 'critical' ? 'critical' : incident.severity === 'warning' ? 'warning' : 'safe'}>
                {incident.severity}
              </Badge>
              <Badge variant={incident.reviewStatus === 'reviewed' ? 'safe' : incident.reviewStatus === 'under_review' ? 'review' : 'neutral'}>
                {incident.reviewStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detected on {formatDateTime(incident.timestamp)} via {incident.detectionSource}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setIsReviewOpen(true)} className="gap-1.5 shadow-sm">
            <Edit3 className="w-3.5 h-3.5" />
            <span>{incident.reviewStatus === 'reviewed' ? 'Update Review Note' : 'Review & Resolve'}</span>
          </Button>
        </div>
      </div>

      {/* Main Content Layout: Evidence Video Player (Left 2 cols) & Telemetry (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Video Evidence Section */}
          <Card padding="none">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">10-Second Video Evidence Capture</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized video recording buffer around violation timestamp ({incident.durationSeconds}s trigger).
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Status: <strong className="text-slate-800 capitalize">{incident.evidenceStatus}</strong>
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-b-lg">
              <VideoPlayer clip={incident.evidenceClip} hasAccessPermission={true} />
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Edge Source:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                  {incident.evidenceClip?.rawLocalPath || 'alerts_evidence/clip.avi'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                AVI converted to H.264 MP4 for secure web playback
              </div>
            </div>
          </Card>

          {/* Review Notes & Assessment */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Safety Officer Review & Coaching Record</CardTitle>
                <CardDescription>Audited assessment and corrective action notes</CardDescription>
              </div>
            </CardHeader>
            {incident.reviewNotes ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-2">
                <p className="text-slate-800 font-medium whitespace-pre-wrap">{incident.reviewNotes}</p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Reviewed by: <strong className="text-slate-700">{incident.reviewedBy}</strong></span>
                  <span>Timestamp: <strong className="text-slate-700">{formatDateTime(incident.reviewedAt || '')}</strong></span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center bg-amber-50/50 border border-amber-200 rounded-md text-xs text-amber-800">
                This incident has not yet been reviewed. Click "Review & Resolve" to log safety triage findings.
              </div>
            )}
          </Card>

          {/* Full Audit History Log */}
          <Card padding="none">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">Immutable Audit Trail</h3>
            </div>
            <div className="p-4 divide-y divide-slate-100">
              {incident.auditTrail.map(log => (
                <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700">{log.actorName} ({log.actorRole})</span>
                    <span className="font-mono">{formatDateTime(log.timestamp)}</span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Detection Details & Telemetry */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Incident Telemetry</CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Violation Type:</span>
                <span className="font-semibold text-slate-900">{formatCategoryName(incident.category)}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Duration:</span>
                <span className="font-mono font-semibold text-slate-900">{incident.durationSeconds} seconds</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Detection Source:</span>
                <span className="font-medium text-slate-800">{incident.detectionSource}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Model Confidence:</span>
                <span className="font-mono font-medium text-slate-800">
                  {incident.confidence !== undefined ? `${Math.round(incident.confidence * 100)}%` : 'Rule Heuristic (EAR)'}
                </span>
              </div>

              <div className="pb-2 border-b border-slate-100">
                <span className="text-slate-500 block mb-1">Cab Hindi Voice Announcement:</span>
                {incident.audioAnnouncedHindi ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px]">
                    <div className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Audio Alert Broadcast in Cab</span>
                    </div>
                    {incident.audioAnnouncedText && (
                      <div className="mt-1 font-mono text-[11px] text-emerald-800">
                        "{incident.audioAnnouncedText}"
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">None triggered</span>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Driver & Vehicle Entity</CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] uppercase">Driver Profile</span>
                <div className="font-semibold text-slate-900 mt-0.5">{incident.driverName}</div>
                <div className="text-slate-500 font-mono text-[11px]">ID: {incident.driverId}</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(ROUTES.OWNER.DRIVER_DETAIL(incident.driverId))}
                  className="h-6 text-[11px] mt-1.5"
                >
                  View Driver Dossier
                </Button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 text-[11px] uppercase">Vehicle Chassis</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{incident.vehicleReg}</div>
                <div className="text-slate-500 font-mono text-[11px]">Ref: {incident.vehicleId}</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(ROUTES.OWNER.VEHICLE_DETAIL(incident.vehicleId))}
                  className="h-6 text-[11px] mt-1.5"
                >
                  View Vehicle Telemetry
                </Button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 text-[11px] uppercase">Edge Unit</span>
                <div className="font-mono text-slate-800 mt-0.5">{incident.deviceId}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <IncidentReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        incident={incident}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};
