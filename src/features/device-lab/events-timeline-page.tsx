import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Volume2, Video, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SearchFilterBar } from '../../components/ui/search-filter-bar';
import { mockStore } from '../../services/mock/mock-store';
import { DetectionEvent } from '../../types';
import { formatDateTime, formatCategoryName } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const EventsTimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<DetectionEvent[]>(mockStore.getState().events);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setEvents(mockStore.getState().events);
    });
  }, []);

  const filtered = events.filter(e => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.id.toLowerCase().includes(q) || e.deviceId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.LAB.DEVICES)} className="h-8 px-2.5">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Hardware Lab</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Chronological Detection Event Stream
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Raw edge inferences generated across fleet devices before ingestion and triage.
            </p>
          </div>
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <SearchFilterBar
            value={search}
            onChange={setSearch}
            placeholder="Search by event ID or device serial..."
          >
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Anomaly Types</option>
              <option value="phone_use">Mobile Phone</option>
              <option value="prolonged_eye_closure">Prolonged Eye Closure</option>
              <option value="distracted_posture">Head Distraction</option>
            </select>

            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
            </select>
          </SearchFilterBar>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No detection events match the selected filters.
            </div>
          ) : (
            filtered.map(evt => (
              <div key={evt.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-700">{evt.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-600 font-medium">{evt.deviceId}</span>
                    <Badge variant={evt.severity === 'critical' ? 'critical' : 'warning'}>
                      {evt.severity}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatCategoryName(evt.category)}
                  </div>
                  {evt.audioText && (
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-0.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-mono">"{evt.audioText}"</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-col items-start sm:items-end justify-between gap-1 text-[11px] text-slate-500 font-mono">
                  <div>{formatDateTime(evt.timestamp)}</div>
                  <div className="flex items-center gap-2">
                    <span>Duration: <strong className="text-slate-800">{evt.durationSeconds}s</strong></span>
                    <span>Confidence: <strong className="text-slate-800">{evt.confidence !== undefined ? `${Math.round(evt.confidence * 100)}%` : 'Rule Heuristic'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px]">
                      Upload: {evt.uploadStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
