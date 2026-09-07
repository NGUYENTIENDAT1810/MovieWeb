'use client';

import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Settings,
  Subtitles,
  Sliders,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/auth-context';

interface VideoPlayerProps {
  videoUrl?: string;
  subtitleUrl?: string;
  thumbnailUrl?: string;
  movieId: string;
  episodeId: string;
  onEnded?: () => void;
}

interface QualityLevel {
  height: number;
  bitrate: number;
  index: number;
}

export function VideoPlayer({
  videoUrl,
  subtitleUrl,
  thumbnailUrl,
  movieId,
  episodeId,
  onEnded,
}: VideoPlayerProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);

  // HLS & Subtitles State
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize HLS or Native HTML5 Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const isHls = videoUrl.includes('.m3u8');

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const levels: QualityLevel[] = data.levels.map((lvl, index) => ({
            height: lvl.height,
            bitrate: lvl.bitrate,
            index,
          }));
          setQualities(levels);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          if (currentQuality === -1) {
            // Auto mode tracks level switched
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS for Safari/iOS
        video.src = videoUrl;
      }
    } else {
      // Standard Direct MP4 / WebM
      video.src = videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  // 2. Auto-Resume Playback from Watch History
  useEffect(() => {
    async function loadResumeProgress() {
      if (!user || !movieId) return;
      try {
        const progress = await api.getMovieProgress(movieId);
        if (progress && progress.progressSeconds > 10 && videoRef.current) {
          videoRef.current.currentTime = progress.progressSeconds;
          setCurrentTime(progress.progressSeconds);
          setHasResumed(true);
        }
      } catch (err) {
        console.error('Failed to load watch progress:', err);
      }
    }

    loadResumeProgress();
  }, [movieId, user]);

  // 3. Periodic Watch History Progress Saving (Every 8 seconds)
  useEffect(() => {
    if (!user || !isPlaying || !movieId) return;

    const interval = setInterval(() => {
      if (videoRef.current) {
        const currentSecs = Math.floor(videoRef.current.currentTime);
        const isCompleted = duration > 0 && currentSecs >= duration * 0.95;
        api.saveHistory({
          movieId,
          episodeId,
          progressSeconds: currentSecs,
          completed: isCompleted,
        }).catch(() => {});
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isPlaying, movieId, episodeId, duration, user]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds),
      );
    }
  };

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Quality Level Switching
  const handleQualityChange = (levelIndex: number) => {
    setCurrentQuality(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
    setShowQualityMenu(false);
  };

  // Subtitle Toggle
  const toggleSubtitles = () => {
    if (!videoRef.current) return;
    const tracks = videoRef.current.textTracks;
    if (tracks && tracks.length > 0) {
      const newEnabled = !subtitlesEnabled;
      setSubtitlesEnabled(newEnabled);
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = newEnabled ? 'showing' : 'hidden';
      }
    }
  };

  // Format time (mm:ss or hh:mm:ss)
  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return '00:00';
    const h = Math.floor(timeInSecs / 3600);
    const m = Math.floor((timeInSecs % 3600) / 60);
    const s = Math.floor(timeInSecs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowQualityMenu(false);
      }
    }, 3500);
  };

  // Fallback: nếu không có videoUrl
  if (!videoUrl) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#101016] border border-[#222230] flex flex-col items-center justify-center p-6 text-center space-y-4">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-20"
          />
        )}
        <div className="relative z-10 w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="relative z-10 space-y-1 max-w-md">
          <h3 className="text-lg font-bold text-white">Chưa có nguồn phát hợp lệ</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Hệ thống chỉ phát các video có bản quyền mở hoặc nguồn stream HLS/MP4 hợp pháp. Quản trị viên có thể nạp nguồn phát video trong bảng điều khiển Admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#20202c] shadow-2xl group select-none"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        poster={thumbnailUrl}
        onClick={togglePlay}
        onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
        onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (user && movieId) {
            api.saveHistory({
              movieId,
              episodeId,
              progressSeconds: Math.floor(duration),
              completed: true,
            }).catch(() => {});
          }
          if (onEnded) onEnded();
        }}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      >
        {subtitleUrl && (
          <track
            kind="subtitles"
            src={subtitleUrl}
            srcLang="vi"
            label="Tiếng Việt"
            default={subtitlesEnabled}
          />
        )}
      </video>

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Resume Notification Badge */}
      {hasResumed && (
        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-primary/40 text-xs text-white flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Đã tiếp tục xem từ {formatTime(currentTime)}</span>
        </div>
      )}

      {/* Stream Type Badge (HLS / MP4) */}
      <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-300 pointer-events-none">
        {videoUrl.includes('.m3u8') ? 'HLS STREAM' : 'MP4 DIRECT'}
      </div>

      {/* Center Big Play Button when Paused */}
      {!isPlaying && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-primary/90 hover:bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/50 transition-all hover:scale-110 z-10"
        >
          <Play className="w-8 h-8 fill-white ml-1" />
        </button>
      )}

      {/* Control Bar Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar (Scrubber) */}
        <div className="relative group/bar flex items-center w-full mb-3 cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-neutral-700/80 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Play / Pause */}
            <button onClick={togglePlay} className="p-1 hover:text-primary transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Skip Back / Forward 10s */}
            <button
              onClick={() => skipTime(-10)}
              className="p-1 hover:text-neutral-300 hidden sm:inline-block"
              title="Lùi 10 giây"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => skipTime(10)}
              className="p-1 hover:text-neutral-300 hidden sm:inline-block"
              title="Tua 10 giây"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-1 hover:text-primary transition-colors">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
            </div>

            {/* Time Stamp */}
            <span className="text-[11px] text-neutral-400 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Subtitle Toggle */}
            {subtitleUrl && (
              <button
                onClick={toggleSubtitles}
                className={`p-1.5 rounded-lg transition-colors ${
                  subtitlesEnabled ? 'text-primary' : 'text-neutral-400 hover:text-white'
                }`}
                title="Bật/Tắt phụ đề"
              >
                <Subtitles className="w-5 h-5" />
              </button>
            )}

            {/* HLS Quality Level Switcher Menu */}
            {qualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-mono ${
                    showQualityMenu ? 'text-primary bg-white/10' : 'text-neutral-300 hover:text-white'
                  }`}
                  title="Chất lượng video"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {currentQuality === -1
                      ? 'Auto'
                      : `${qualities[currentQuality]?.height || 720}p`}
                  </span>
                </button>

                {showQualityMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-32 rounded-xl bg-[#141420] border border-[#242436] py-1 shadow-2xl text-xs z-30">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider border-b border-[#202030]">
                      Độ phân giải
                    </div>
                    <button
                      onClick={() => handleQualityChange(-1)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-[#202032] flex items-center justify-between transition-colors ${
                        currentQuality === -1 ? 'text-primary font-bold' : 'text-neutral-300'
                      }`}
                    >
                      <span>Tự động (Auto)</span>
                      {currentQuality === -1 && <CheckCircle className="w-3 h-3 text-primary" />}
                    </button>
                    {qualities.map((lvl) => (
                      <button
                        key={lvl.index}
                        onClick={() => handleQualityChange(lvl.index)}
                        className={`w-full text-left px-3 py-1.5 hover:bg-[#202032] flex items-center justify-between transition-colors ${
                          currentQuality === lvl.index ? 'text-primary font-bold' : 'text-neutral-300'
                        }`}
                      >
                        <span>{lvl.height}p</span>
                        {currentQuality === lvl.index && (
                          <CheckCircle className="w-3 h-3 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Toàn màn hình"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
