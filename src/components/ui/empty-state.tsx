import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-slate-200 rounded-lg">
    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
      {icon || <Inbox className="w-5 h-5" />}
    </div>
    <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
    <p className="text-xs text-slate-500 max-w-sm mt-1">{description}</p>
    {actionLabel && onAction && (
      <div className="mt-4">
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    )}
  </div>
);

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Unavailable',
  message,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center p-6 text-center bg-rose-50/50 border border-rose-200 rounded-lg">
    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
      <AlertCircle className="w-5 h-5" />
    </div>
    <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
    <p className="text-xs text-rose-700 max-w-md mt-1">{message}</p>
    {onRetry && (
      <div className="mt-4">
        <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5 border-rose-300 text-rose-800 hover:bg-rose-50">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </Button>
      </div>
    )}
  </div>
);
