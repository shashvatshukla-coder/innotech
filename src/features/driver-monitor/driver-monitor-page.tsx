import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  Volume2, 
  Maximize2, 
  Clock, 
  User, 
  Truck,
  Languages
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../components/ui/button';
import { formatDuration } from '../../utils/formatters';

type DriverSafetyState = 'safe' | 'warning' | 'drowsiness' | 'phone_use' | 'critical' | 'offline';
type Language = 'en' | 'hi';

export const DriverMonitorPage: React.FC = () => {
  const [safetyState, setSafetyState] = useState<DriverSafetyState>('safe');
  const [lang, setLang] = useState<Language>('en');
  const [elapsed, setElapsed] = useState(14820); // 4h 07m active shift
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const MESSAGES: Record<DriverSafetyState, { en: { title: string; subtitle: string }; hi: { title: string; subtitle: string } }> = {
    safe: {
      en: {
        title: 'MONITORED & SAFE',
        subtitle: 'You are being monitored. Drive safely and maintain safe following distance.',
      },
      hi: {
        title: 'निगरानी सक्रिय एवं सुरक्षित',
        subtitle: 'आपकी सुरक्षा निगरानी सक्रिय है। कृपया सुरक्षित रूप से वाहन चलाएं।',
      },
    },
    warning: {
      en: {
        title: 'ATTENTION REQUIRED',
        subtitle: 'Please keep your eyes focused on the road ahead.',
      },
      hi: {
        title: 'सड़क पर ध्यान दें',
        subtitle: 'कृपया सामने सड़क पर ध्यान केंद्रित रखें।',
      },
    },
    drowsiness: {
      en: {
        title: 'FATIGUE DETECTED',
        subtitle: 'Please stay alert. If you feel sleepy, stop somewhere safe immediately.',
      },
      hi: {
        title: 'थकान या झपकी का संकेत',
        subtitle: 'कृपया सतर्क रहें। यदि नींद या थकान महसूस हो, तो तुरंत सुरक्षित स्थान पर रुकें।',
      },
    },
    phone_use: {
      en: {
        title: 'PHONE USE DETECTED',
        subtitle: 'Please stop using your mobile phone while driving.',
      },
      hi: {
        title: 'मोबाइल फोन का उपयोग बंद करें',
        subtitle: 'वाहन चलाते समय मोबाइल फोन का उपयोग बिल्कुल न करें।',
      },
    },
    critical: {
      en: {
        title: 'CRITICAL WARNING: STOP SAFELY',
        subtitle: 'Prolonged inattention or eye closure detected. Pull over safely as soon as possible.',
      },
      hi: {
        title: 'गंभीर चेतावनी: तुरंत वाहन रोकें',
        subtitle: 'लगातार आंखें बंद पाई गईं। कृपया जल्द से जल्द वाहन को सुरक्षित स्थान पर रोकें।',
      },
    },
    offline: {
      en: {
        title: 'SYSTEM OFFLINE',
        subtitle: 'Monitoring connection unavailable. Follow your fleet safety procedure.',
      },
      hi: {
        title: 'सिस्टम कनेक्शन उपलब्ध नहीं',
        subtitle: 'निगरानी कनेक्शन बाधित है। अपनी कंपनी की सुरक्षा प्रक्रिया का पालन करें।',
      },
    },
  };

  const currentMsg = MESSAGES[safetyState][lang];

  // Visual Theme Mapping
  const theme = {
    safe: {
      bg: 'bg-emerald-950/95',
      card: 'bg-emerald-900/60 border-emerald-500/40 text-emerald-100',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      borderGlow: 'ring-1 ring-emerald-500/30',
    },
    warning: {
      bg: 'bg-amber-950/95',
      card: 'bg-amber-900/60 border-amber-500/40 text-amber-100',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      borderGlow: 'ring-1 ring-amber-500/30',
    },
    drowsiness: {
      bg: 'bg-rose-950/95',
      card: 'bg-rose-900/60 border-rose-500/40 text-rose-100',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      borderGlow: 'ring-2 ring-rose-500/50',
    },
    phone_use: {
      bg: 'bg-amber-950/95',
      card: 'bg-amber-900/60 border-amber-500/40 text-amber-100',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      borderGlow: 'ring-1 ring-amber-500/30',
    },
    critical: {
      bg: 'bg-rose-950/95',
      card: 'bg-rose-900/70 border-rose-500 text-white',
      badge: 'bg-rose-600 text-white border-rose-400',
      icon: ShieldAlert,
      iconColor: 'text-rose-300',
      borderGlow: 'ring-4 ring-rose-500/60 animate-pulse',
    },
    offline: {
      bg: 'bg-slate-950/95',
      card: 'bg-slate-900/80 border-slate-700 text-slate-200',
      badge: 'bg-slate-800 text-slate-300 border-slate-600',
      icon: WifiOff,
      iconColor: 'text-slate-400',
      borderGlow: 'ring-1 ring-slate-700',
    },
  }[safetyState];

  const StatusIcon = theme.icon;

  return (
    <div className={clsx('min-h-[85vh] rounded-xl flex flex-col justify-between p-6 sm:p-10 transition-colors duration-300', theme.bg)}>
      {/* Top HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-mono text-slate-400">Vehicle Assigned</span>
            <span className="text-lg font-bold font-mono text-white tracking-wider">MH-12-RN-4821</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex flex-col">
            <span className="text-xs uppercase font-mono text-slate-400">Driver</span>
            <span className="text-sm font-semibold text-white">Rameshwar Yadav</span>
          </div>
        </div>

        {/* Live Shift Clock & Status Controls */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-black/40 rounded-lg border border-white/10 flex items-center gap-2 text-xs font-mono text-slate-200">
            <Clock className="w-4 h-4 text-brand-400" />
            <span>SHIFT TIME: {formatDuration(elapsed)}</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-1 text-xs">
            <button
              onClick={() => setLang('en')}
              className={clsx('px-2.5 py-1 rounded font-semibold transition-colors', lang === 'en' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white')}
            >
              ENG
            </button>
            <button
              onClick={() => setLang('hi')}
              className={clsx('px-2.5 py-1 rounded font-semibold transition-colors', lang === 'hi' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white')}
            >
              हिन्दी
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/10 h-8 px-2"
            title="Toggle Fullscreen Tablet Mode"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Big Glanceable Status Banner (Optimized for Truck Cab Mount) */}
      <div className={clsx('my-8 p-8 sm:p-12 rounded-2xl border flex flex-col items-center justify-center text-center shadow-2xl transition-all', theme.card, theme.borderGlow)}>
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-black/30 flex items-center justify-center mb-6 border border-white/10">
          <StatusIcon className={clsx('w-12 h-12 sm:w-16 sm:h-16', theme.iconColor)} />
        </div>

        <span className={clsx('px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider border mb-3', theme.badge)}>
          {safetyState.replace(/_/g, ' ')}
        </span>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
          {currentMsg.title}
        </h1>

        <p className="text-sm sm:text-lg text-slate-200/90 max-w-xl font-medium leading-relaxed">
          {currentMsg.subtitle}
        </p>
      </div>

      {/* Bottom Testing Controls & Telemetry Feedback (Minimal Distraction in Cab) */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {safetyState !== 'offline' ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Wifi className="w-4 h-4" />
              <span className="font-mono">SafeDrive AI Edge Unit Connected • 30 FPS</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <WifiOff className="w-4 h-4" />
              <span className="font-mono">Offline • Reconnecting to Vehicle CAN-Bus...</span>
            </div>
          )}
        </div>

        {/* State Simulator Buttons for Demo Testing */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono uppercase text-slate-400 px-1.5">Test State:</span>
          {(['safe', 'warning', 'drowsiness', 'phone_use', 'critical', 'offline'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSafetyState(s)}
              className={clsx(
                'px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors',
                safetyState === s ? 'bg-white text-slate-900 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
              )}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
