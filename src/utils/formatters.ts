// SafeDrive AI - Formatters & Display Utilities

/**
 * Format numbers in Indian Numbering System (Lakhs and Crores)
 * e.g. 125000 -> ₹1,25,000
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format numeric quantity with commas
 */
export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
}

/**
 * Format date in readable format: DD MMM YYYY, HH:mm IST
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Format short date: DD MMM YYYY
 */
export function formatDate(isoString: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Format time only: HH:mm:ss
 */
export function formatTime(isoString: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Format duration in seconds to "Xm Ys" or "Xh Ym"
 */
export function formatDuration(seconds: number): string {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '0s';
  const s = Math.max(0, Math.floor(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const remainingSec = s % 60;
  if (m < 60) {
    return remainingSec > 0 ? `${m}m ${remainingSec}s` : `${m}m`;
  }
  const h = Math.floor(m / 60);
  const remainingMin = m % 60;
  return remainingMin > 0 ? `${h}h ${remainingMin}m` : `${h}h`;
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return 'Unavailable';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Category friendly names
 */
export function formatCategoryName(category: string): string {
  switch (category) {
    case 'drowsiness':
      return 'Potential Drowsiness';
    case 'prolonged_eye_closure':
      return 'Prolonged Eye Closure';
    case 'phone_use':
      return 'Mobile Phone Detected';
    case 'distracted_posture':
      return 'Distracted Head Posture';
    case 'driver_unresponsive':
      return 'Driver Not Detected / Unresponsive';
    case 'sync_failure':
      return 'Edge Synchronization Failure';
    default:
      return category.replace(/_/g, ' ');
  }
}

/**
 * Severity friendly names
 */
export function formatSeverityName(sev: string): string {
  switch (sev) {
    case 'critical':
      return 'Critical Event';
    case 'warning':
      return 'Warning Alert';
    case 'safe':
      return 'Safe / Normal';
    default:
      return sev;
  }
}
