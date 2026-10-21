// SafeDrive AI - Centralized Enterprise Design Tokens

export const DESIGN_TOKENS = {
  typography: {
    fontFamilySans: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'JetBrains Mono, ui-monospace, monospace',
    scale: {
      pageTitle: 'text-2xl font-semibold tracking-tight text-slate-900', // 24-28px
      sectionHeading: 'text-lg font-semibold text-slate-800',           // 16-18px
      cardHeader: 'text-sm font-semibold text-slate-700',               // 14px uppercase/tracking
      body: 'text-sm text-slate-600',                                   // 13-14px
      metadata: 'text-xs text-slate-500',                               // 12px
      kpiNumber: 'text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums', // 26-32px
    },
  },
  layout: {
    sidebarExpandedWidth: 248, // 248px
    sidebarCollapsedWidth: 64,  // 64px
    headerHeight: 56,           // 56px
    maxContentWidth: 'max-w-7xl',
    gutter: 'px-4 sm:px-6 lg:px-8',
    cardPadding: 'p-4 sm:p-5',
    tableRowHeight: 'h-11',
  },
  colors: {
    navyBg: '#0f172a',
    navyHover: '#1e293b',
    canvasBg: '#f8fafc',
    cardBg: '#ffffff',
    border: '#e2e8f0',
    primaryBlue: '#2563eb',
    primaryBlueHover: '#1d4ed8',
  },
  statusTheme: {
    safe: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Safe / Normal',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'Warning Alert',
    },
    critical: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-600',
      label: 'Critical Incident',
    },
    offline: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      dot: 'bg-slate-400',
      label: 'Offline / Disconnected',
    },
    pendingReview: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
      label: 'Pending Review',
    },
    reviewed: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      label: 'Reviewed',
    },
  },
  defaultThresholds: {
    warningThresholdSeconds: 5,
    criticalThresholdSeconds: 10,
    audioCooldownSeconds: 4,
    evidenceClipDurationSeconds: 10,
    earClosureThreshold: 0.22,
    headPosePitchToleranceDeg: 25,
  },
} as const;
