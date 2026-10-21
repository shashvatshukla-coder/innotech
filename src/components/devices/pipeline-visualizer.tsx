import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/button';

export interface PipelineStep {
  id: number;
  label: string;
  sublabel: string;
  status: 'completed' | 'processing' | 'pending' | 'failed';
  errorDetails?: string;
}

export interface PipelineVisualizerProps {
  steps?: PipelineStep[];
  onRetryStep?: (stepId: number) => void;
  isRetrying?: boolean;
}

const DEFAULT_STEPS: PipelineStep[] = [
  { id: 1, label: '1. Local Edge Detection', sublabel: 'YOLOv8 & MediaPipe EAR', status: 'completed' },
  { id: 2, label: '2. Cab Hindi Audio Alert', sublabel: 'gTTS & playsound', status: 'completed' },
  { id: 3, label: '3. Evidence Video Buffer', sublabel: '10s loop clip (.avi)', status: 'completed' },
  { id: 4, label: '4. Metadata Packaging', sublabel: 'Device & Driver telemetry', status: 'completed' },
  { id: 5, label: '5. Ingest API Submission', sublabel: 'REST HTTPS POST', status: 'completed' },
  { id: 6, label: '6. Storage & Transcoding', sublabel: 'S3 & ffmpeg MP4 conversion', status: 'completed' },
  { id: 7, label: '7. Database Acknowledgment', sublabel: 'ACID PostgreSQL insert', status: 'completed' },
  { id: 8, label: '8. Fleet Sync & Review Queue', sublabel: 'WebSocket dispatch', status: 'completed' },
];

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  steps = DEFAULT_STEPS,
  onRetryStep,
  isRetrying = false,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-card">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Edge-to-Cloud Integration Pipeline</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end lifecycle from local computer vision detection through cab voice alert, cloud transcoding, and dashboard incident synchronization.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
          Pipeline v2.4
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, idx) => {
          const isFailed = step.status === 'failed';
          const isProcessing = step.status === 'processing';
          const isPending = step.status === 'pending';
          const isCompleted = step.status === 'completed';

          return (
            <div
              key={step.id}
              className={clsx(
                'relative flex flex-col justify-between p-3 rounded-lg border text-xs transition-all',
                isCompleted && 'bg-emerald-50/50 border-emerald-200 text-emerald-950',
                isProcessing && 'bg-blue-50/50 border-blue-200 text-blue-950 ring-2 ring-blue-400/20',
                isFailed && 'bg-rose-50/60 border-rose-300 text-rose-950',
                isPending && 'bg-slate-50 border-slate-200 text-slate-500'
              )}
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <span className="font-semibold">{step.label}</span>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                {isProcessing && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />}
                {isFailed && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                {isPending && <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </div>

              <div className="text-[11px] text-slate-600 mb-2">
                {step.sublabel}
              </div>

              {step.errorDetails && (
                <div className="p-2 mb-2 bg-rose-100/70 border border-rose-300 rounded text-[11px] text-rose-800">
                  {step.errorDetails}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-[10px]">
                <span
                  className={clsx(
                    'font-medium uppercase tracking-wider',
                    isCompleted && 'text-emerald-700',
                    isProcessing && 'text-blue-700',
                    isFailed && 'text-rose-700',
                    isPending && 'text-slate-400'
                  )}
                >
                  {step.status}
                </span>

                {isFailed && onRetryStep && (
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={isRetrying}
                    onClick={() => onRetryStep(step.id)}
                    className="h-6 px-2 text-[10px]"
                  >
                    Retry Job
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
