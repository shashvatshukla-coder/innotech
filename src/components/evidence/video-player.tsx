import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertTriangle, FileVideo, RefreshCw, ShieldAlert } from 'lucide-react';
import { EvidenceClip } from '../../types';
import { formatBytes } from '../../utils/formatters';

export interface VideoPlayerProps {
  clip?: EvidenceClip;
  hasAccessPermission?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  clip,
  hasAccessPermission = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(clip?.durationSeconds || 10);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
    setIsLoading(true);
  }, [clip?.mediaUrl, clip?.clipId]);

  if (!hasAccessPermission) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center p-6 text-center text-slate-300 border border-slate-800">
        <ShieldAlert className="w-10 h-10 text-amber-500 mb-2" />
        <h4 className="text-sm font-semibold text-white">Restricted Evidence Access</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Viewing biometric video evidence requires elevated Safety Reviewer or Fleet Owner permissions according to privacy compliance policy.
        </p>
      </div>
    );
  }

  if (!clip || clip.status === 'unavailable' || clip.status === 'corrupted') {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center p-6 text-center text-slate-300 border border-slate-800">
        <FileVideo className="w-10 h-10 text-slate-500 mb-2" />
        <h4 className="text-sm font-semibold text-white">Evidence Clip Unavailable</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          {clip?.failureReason || 'Evidence recording was aborted or corrupted during edge storage write.'}
        </p>
        {clip?.rawLocalPath && (
          <span className="mt-2 text-[11px] font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">
            Internal edge log: {clip.rawLocalPath}
          </span>
        )}
      </div>
    );
  }

  if (clip.status === 'processing' || clip.status === 'upload_pending') {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center p-6 text-center text-slate-300 border border-slate-800">
        <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mb-3" />
        <h4 className="text-sm font-semibold text-white">Transcoding & Cloud Synchronization in Progress</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Raw edge clip ({clip.rawLocalPath || 'alert.avi'}) is undergoing cloud ffmpeg conversion to web-compatible MP4 format.
        </p>
      </div>
    );
  }

  if (clip.status === 'upload_failed') {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center p-6 text-center text-slate-300 border border-slate-800">
        <AlertTriangle className="w-10 h-10 text-rose-500 mb-2" />
        <h4 className="text-sm font-semibold text-white">Evidence Upload Failed</h4>
        <p className="text-xs text-rose-300 max-w-sm mt-1">
          {clip.failureReason || 'Failed to upload from vehicle edge unit.'}
        </p>
        <span className="mt-2 text-[11px] font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">
          Buffered locally at: {clip.rawLocalPath || 'alerts_evidence/'}
        </span>
      </div>
    );
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setHasError(true));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 group shadow-lg">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={clip.mediaUrl}
        playsInline
        muted={isMuted}
        onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration || clip.durationSeconds || 10);
            setIsLoading(false);
          }
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onEnded={() => setIsPlaying(false)}
        className="w-full aspect-video object-contain bg-black"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-500 mb-2" />
          <p className="text-xs text-slate-300 font-medium">Failed to decode stream</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Please check codec compatibility or try refreshing.</p>
        </div>
      )}

      {/* Transcoded Badge & Metadata info */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
        <span className="px-2 py-0.5 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-emerald-400 rounded border border-emerald-500/30">
          MP4 Transcoded
        </span>
        {clip.resolution && (
          <span className="px-2 py-0.5 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-slate-300 rounded border border-slate-700">
            {clip.resolution}
          </span>
        )}
      </div>

      <div className="absolute top-2.5 right-2.5">
        <span className="px-2 py-0.5 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-slate-300 rounded border border-slate-700">
          {formatBytes(clip.fileSizeBytes)}
        </span>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6 flex flex-col gap-1.5 transition-opacity">
        {/* Scrubber */}
        <input
          type="range"
          min={0}
          max={duration || 10}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
          aria-label="Seek Video"
        />

        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-brand-400 transition-colors focus:outline-none"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1 hover:text-brand-400 transition-colors focus:outline-none"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="font-mono text-[11px] text-slate-300 tabular-nums">
              {Math.floor(currentTime)}s / {Math.floor(duration)}s
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {clip.clipId}
          </div>
        </div>
      </div>
    </div>
  );
};
