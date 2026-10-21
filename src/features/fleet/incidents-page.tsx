import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Download, ExternalLink, Edit3, ArrowUpDown, Video, FileVideo } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SearchFilterBar } from '../../components/ui/search-filter-bar';
import { Pagination } from '../../components/ui/pagination';
import { IncidentReviewModal } from './incident-review-modal';
import { mockStore } from '../../services/mock/mock-store';
import { apiClient } from '../../services/api/client';
import { SafetyIncident } from '../../types';
import { formatDateTime, formatCategoryName, formatSeverityName } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv-export';
import { ROUTES } from '../../constants/routes';

export const IncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<SafetyIncident[]>(mockStore.getState().incidents);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Review modal state
  const [reviewingIncident, setReviewingIncident] = useState<SafetyIncident | null>(null);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setIncidents(mockStore.getState().incidents);
    });
  }, []);

  const drivers = mockStore.getState().drivers;
  const vehicles = mockStore.getState().vehicles;

  const filtered = useMemo(() => {
    return incidents.filter(inc => {
      if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
      if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
      if (reviewFilter !== 'all' && inc.reviewStatus !== reviewFilter) return false;
      if (evidenceFilter !== 'all') {
        if (evidenceFilter === 'ready' && inc.evidenceStatus !== 'ready') return false;
        if (evidenceFilter === 'unavailable' && inc.evidenceStatus !== 'unavailable' && inc.evidenceStatus !== 'upload_failed') return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          inc.id.toLowerCase().includes(q) ||
          inc.driverName.toLowerCase().includes(q) ||
          inc.vehicleReg.toLowerCase().includes(q) ||
          (inc.reviewNotes && inc.reviewNotes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [incidents, search, categoryFilter, severityFilter, reviewFilter, evidenceFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleExportCSV = () => {
    exportToCSV('safedrive_fleet_incidents', filtered, [
      { header: 'Incident ID', accessor: i => i.id },
      { header: 'Timestamp', accessor: i => i.timestamp },
      { header: 'Driver Name', accessor: i => i.driverName },
      { header: 'Vehicle Plate', accessor: i => i.vehicleReg },
      { header: 'Device Serial', accessor: i => i.deviceId },
      { header: 'Category', accessor: i => i.category },
      { header: 'Severity', accessor: i => i.severity },
      { header: 'Duration (Sec)', accessor: i => i.durationSeconds },
      { header: 'Detection Source', accessor: i => i.detectionSource },
      { header: 'Confidence', accessor: i => i.confidence !== undefined ? `${Math.round(i.confidence * 100)}%` : 'N/A' },
      { header: 'Evidence Status', accessor: i => i.evidenceStatus },
      { header: 'Review Status', accessor: i => i.reviewStatus },
      { header: 'Reviewed By', accessor: i => i.reviewedBy || 'Unreviewed' },
      { header: 'Review Notes', accessor: i => i.reviewNotes || '' },
    ]);
  };

  const handleReviewSubmit = async (note: string, markReviewed: boolean) => {
    if (!reviewingIncident) return;
    await apiClient.addIncidentReview(
      reviewingIncident.id,
      { note, markReviewed },
      'Safety Reviewer'
    );
    setReviewingIncident(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Safety Incident Triage & Evidence Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fatigue events, mobile phone detections, edge watchdog anomalies, and compliance audit log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 h-8">
            <Download className="w-3.5 h-3.5" />
            <span>Export Filtered CSV</span>
          </Button>
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <SearchFilterBar
            value={search}
            onChange={val => { setSearch(val); setPage(1); }}
            placeholder="Search by incident ID, driver name, vehicle plate, or audit notes..."
          >
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="prolonged_eye_closure">Prolonged Eye Closure</option>
              <option value="drowsiness">Potential Drowsiness</option>
              <option value="phone_use">Mobile Phone Use</option>
              <option value="distracted_posture">Distracted Head Posture</option>
              <option value="sync_failure">Edge Sync Failure</option>
            </select>

            <select
              value={severityFilter}
              onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
            </select>

            <select
              value={reviewFilter}
              onChange={e => { setReviewFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Review States</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="reviewed">Reviewed</option>
            </select>

            <select
              value={evidenceFilter}
              onChange={e => { setEvidenceFilter(e.target.value); setPage(1); }}
              className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Evidence States</option>
              <option value="ready">Clip Ready (MP4)</option>
              <option value="unavailable">Unavailable / Failed</option>
            </select>
          </SearchFilterBar>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Incident #</th>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Driver</th>
                <th className="py-2.5 px-3 font-semibold">Vehicle</th>
                <th className="py-2.5 px-3 font-semibold">Violation Type</th>
                <th className="py-2.5 px-3 font-semibold">Severity</th>
                <th className="py-2.5 px-3 font-semibold text-right">Duration</th>
                <th className="py-2.5 px-3 font-semibold">Evidence</th>
                <th className="py-2.5 px-3 font-semibold">Review Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No safety incidents match the selected multi-factor filters.
                  </td>
                </tr>
              ) : (
                paginated.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-brand-700">
                      {inc.id}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(inc.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{inc.driverName}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{inc.vehicleReg}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {formatCategoryName(inc.category)}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={inc.severity === 'critical' ? 'critical' : inc.severity === 'warning' ? 'warning' : 'safe'}>
                        {inc.severity}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {inc.durationSeconds}s
                    </td>
                    <td className="py-2.5 px-3">
                      {inc.evidenceStatus === 'ready' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <Video className="w-3 h-3" />
                          <span>Ready</span>
                        </span>
                      ) : inc.evidenceStatus === 'processing' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          <span>Processing</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          <FileVideo className="w-3 h-3" />
                          <span>{inc.evidenceStatus}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={inc.reviewStatus === 'reviewed' ? 'safe' : inc.reviewStatus === 'under_review' ? 'review' : 'neutral'}>
                        {inc.reviewStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReviewingIncident(inc)}
                          className="h-7 px-2 text-slate-600 hover:text-brand-600"
                          title="Add Review Note"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(ROUTES.OWNER.INCIDENT_DETAIL(inc.id))}
                          className="h-7 px-2 text-slate-600 hover:text-brand-600"
                          title="View Full Incident Dossier & Evidence"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </Card>

      <IncidentReviewModal
        isOpen={!!reviewingIncident}
        onClose={() => setReviewingIncident(null)}
        incident={reviewingIncident}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};
