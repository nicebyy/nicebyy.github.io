"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Disc3,
  ChevronUp,
  Radio,
} from "lucide-react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  genre: string;
  license: string;
}

export const PLAYLIST: Track[] = [
  {
    id: "kosmorider-night",
    title: "Night",
    artist: "Kosmorider",
    src: "/audio/kosmorider-night.mp3",
    genre: "Cyberpunk Synthwave",
    license: "CC-BY 4.0",
  },
  {
    id: "muktodmi-night-lights",
    title: "Night Lights 2",
    artist: "MuktoDMI",
    src: "/audio/muktodmi-night-lights.mp3",
    genre: "Dark Synthwave",
    license: "Creative Commons",
  },
];

export function CyberBgmPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35); // 35% default for gentle background listening
  const [isMuted, setIsMuted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // Restore saved settings on mount
  useEffect(() => {
    try {
      const savedVolume = localStorage.getItem("kimgatta_bgm_volume");
      if (savedVolume !== null) {
        const parsed = parseFloat(savedVolume);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setVolume(parsed);
        }
      }

      const savedTrack = localStorage.getItem("kimgatta_bgm_track");
      if (savedTrack !== null) {
        const parsed = parseInt(savedTrack, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < PLAYLIST.length) {
          setCurrentTrackIndex(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Update audio volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle outside click to close popover panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsPanelOpen(false);
      }
    };
    if (isPanelOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isPanelOpen]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      // Play next track or loop
      handleNextTrack();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrackIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay policy or load failure
          setIsPlaying(false);
        });
    }
  };

  const handleNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    try {
      localStorage.setItem("kimgatta_bgm_track", String(nextIndex));
    } catch {
      // ignore
    }

    if (audioRef.current) {
      audioRef.current.src = PLAYLIST[nextIndex].src;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  };

  const handlePrevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(prevIndex);
    try {
      localStorage.setItem("kimgatta_bgm_track", String(prevIndex));
    } catch {
      // ignore
    }

    if (audioRef.current) {
      audioRef.current.src = PLAYLIST[prevIndex].src;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
    try {
      localStorage.setItem("kimgatta_bgm_volume", String(val));
    } catch {
      // ignore
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div ref={panelRef} className="relative inline-flex items-center">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
        loop={PLAYLIST.length === 1}
      />

      {/* Main Navbar Trigger Button */}
      <div
        className={`inline-flex items-center rounded-xl border transition-all ${
          isPlaying
            ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(0,243,255,0.35)]"
            : "border-cyan-500/30 bg-black/50 hover:border-cyan-400 hover:bg-cyan-500/10"
        }`}
      >
        {/* Play / Pause Toggle Button */}
        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? "BGM 일시정지" : "사이버펑크 BGM 재생"}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer group"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-neon-pink animate-pulse" />
          ) : (
            <Play className="w-3.5 h-3.5 text-neon-cyan group-hover:drop-shadow-[0_0_6px_#00f3ff]" />
          )}

          {/* Cyber Equalizer Animation Bars */}
          <div className="flex items-end gap-0.5 h-3 w-3.5 overflow-hidden">
            <span
              className={`w-0.5 rounded-full bg-neon-cyan transition-all duration-150 ${
                isPlaying ? "h-full animate-[pulse_0.6s_ease-in-out_infinite]" : "h-1 bg-slate-600"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-neon-pink transition-all duration-150 ${
                isPlaying ? "h-2/3 animate-[pulse_0.4s_ease-in-out_infinite_0.1s]" : "h-1 bg-slate-600"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-neon-green transition-all duration-150 ${
                isPlaying ? "h-4/5 animate-[pulse_0.7s_ease-in-out_infinite_0.2s]" : "h-1 bg-slate-600"
              }`}
            />
          </div>

          {/* Desktop Track Indicator */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-chakra tracking-wider text-slate-300 group-hover:text-white">
            <span className={isPlaying ? "text-neon-cyan font-bold" : "text-slate-400"}>
              {isPlaying ? "BGM //" : "BGM"}
            </span>
            <span className="max-w-[90px] truncate text-slate-300">
              {currentTrack.title}
            </span>
          </span>
        </button>

        {/* Popover Toggle Chevron */}
        <button
          type="button"
          onClick={() => setIsPanelOpen((prev) => !prev)}
          title="BGM 컨트롤 패널 열기"
          className="px-1.5 py-1.5 border-l border-cyan-500/20 text-slate-400 hover:text-neon-cyan transition-colors cursor-pointer"
        >
          <ChevronUp
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isPanelOpen ? "rotate-180 text-neon-cyan" : ""
            }`}
          />
        </button>
      </div>

      {/* Cyberpunk HUD Audio Control Panel Popover */}
      {isPanelOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-cyan-500/50 bg-[#070b14]/95 backdrop-blur-xl p-4 shadow-[0_0_25px_rgba(0,243,255,0.35)] z-50 space-y-3 font-mono animate-in fade-in zoom-in-95 duration-150">
          {/* Header with Cyber Status */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-neon-cyan animate-pulse" />
              <span className="text-[11px] font-chakra tracking-widest text-neon-cyan font-bold uppercase">
                // CYBER_AUDIO_DECK
              </span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                isPlaying
                  ? "bg-emerald-500/20 text-neon-green border-emerald-500/50 shadow-[0_0_6px_#00ff9d]"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {isPlaying ? "ON AIR" : "STANDBY"}
            </span>
          </div>

          {/* Current Track Display */}
          <div className="rounded-xl border border-white/10 bg-black/60 p-2.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-neon-pink font-bold">{currentTrack.genre}</span>
              <span className="text-[9px] bg-white/5 px-1 rounded text-slate-400 border border-white/10">
                {currentTrack.license}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Disc3
                className={`w-5 h-5 text-neon-cyan shrink-0 ${
                  isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                }`}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                  {currentTrack.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  by {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Progress Bar & Time */}
            <div className="pt-1.5 space-y-1">
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all duration-200"
                  style={{
                    width: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevTrack}
                title="이전 곡"
                className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/15 text-slate-300 hover:text-neon-cyan transition-all cursor-pointer"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? "일시정지" : "재생"}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isPlaying
                    ? "bg-pink-500/20 text-neon-pink border-pink-500 shadow-[0_0_12px_#ff007f]"
                    : "bg-cyan-500/20 text-neon-cyan border-cyan-400 shadow-[0_0_12px_#00f3ff]"
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleNextTrack}
                title="다음 곡"
                className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/15 text-slate-300 hover:text-neon-cyan transition-all cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? "음소거 해제" : "음소거"}
                className="text-slate-400 hover:text-neon-cyan transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-pink-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-neon-cyan" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="볼륨 조절"
                className="w-16 sm:w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Playlist selector */}
          <div className="border-t border-cyan-500/20 pt-2 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              // PLAYLIST ({PLAYLIST.length})
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto cyber-scrollbar">
              {PLAYLIST.map((track, idx) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    if (audioRef.current) {
                      audioRef.current.src = track.src;
                      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                    }
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg text-[10px] flex items-center justify-between transition-all cursor-pointer ${
                    currentTrackIndex === idx
                      ? "bg-cyan-500/20 text-neon-cyan border border-cyan-400/50 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className="truncate">
                    {idx + 1}. {track.title}
                  </span>
                  <span className="text-[9px] text-slate-400 shrink-0 ml-1">
                    {track.genre.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
