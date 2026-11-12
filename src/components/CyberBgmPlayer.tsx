"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Disc3,
  ChevronUp,
  Radio,
  Repeat,
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
  {
    id: "newgameplus-per-aspera",
    title: "Per Aspera Ad Astra",
    artist: "NewGame+",
    src: "/audio/newgameplus-per-aspera.mp3",
    genre: "Dark Synthwave",
    license: "Creative Commons",
  },
  {
    id: "tempest-32-degrees",
    title: "32 Degrees",
    artist: "Tempest",
    src: "/audio/tempest-32-degrees.mp3",
    genre: "Darksynth",
    license: "Creative Commons",
  },
  {
    id: "ghostrifter-deflector",
    title: "Deflector",
    artist: "Ghostrifter Official",
    src: "/audio/ghostrifter-deflector.mp3",
    genre: "Cyberpunk Synthwave",
    license: "CC BY-SA 3.0",
  },
];

// Gentle, calm ambient default volume (12%) so reading remains comfortable
const DEFAULT_BGM_VOLUME = 0.12;
const FADE_IN_DURATION_MS = 1200;

export function CyberBgmPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_BGM_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Refs to prevent stale closures inside event listeners & fade intervals
  const volumeRef = useRef(DEFAULT_BGM_VOLUME);
  const isMutedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const currentTrackIndexRef = useRef(0);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unlockCleanupRef = useRef<(() => void) | null>(null);
  const playRequestIdRef = useRef(0);

  const currentTrack = PLAYLIST[currentTrackIndex];

  const getTargetVolume = useCallback(() => {
    return isMutedRef.current ? 0 : volumeRef.current;
  }, []);

  const clearFade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  const clearInteractionUnlock = useCallback(() => {
    if (unlockCleanupRef.current) {
      unlockCleanupRef.current();
      unlockCleanupRef.current = null;
    }
  }, []);

  const startFadeIn = useCallback(
    (audio: HTMLAudioElement) => {
      clearFade();
      const targetVol = getTargetVolume();
      if (targetVol <= 0) {
        audio.volume = 0;
        return;
      }

      const steps = 20;
      const stepTime = FADE_IN_DURATION_MS / steps;
      let currentStep = 0;
      // Start at a gentle whisper (15% of target) rather than strict 0 so sound is never perceived as dead
      const startVol = targetVol * 0.15;
      audio.volume = startVol;

      fadeIntervalRef.current = setInterval(() => {
        currentStep += 1;
        const latestTarget = getTargetVolume();
        const ratio = Math.min(1, currentStep / steps);
        audio.volume = Number(
          (startVol + (latestTarget - startVol) * ratio).toFixed(4)
        );

        if (currentStep >= steps) {
          audio.volume = latestTarget;
          clearFade();
        }
      }, stepTime);
    },
    [clearFade, getTargetVolume]
  );

  // Core playback helper: imperative src + load() avoids React re-render race conditions
  const playCurrentAudio = useCallback(
    async (withFadeIn = false) => {
      const audio = audioRef.current;
      if (!audio) return false;

      const reqId = ++playRequestIdRef.current;
      clearFade();
      audio.volume = withFadeIn ? getTargetVolume() * 0.15 : getTargetVolume();

      try {
        await audio.play();
        if (reqId !== playRequestIdRef.current) return false;

        setIsPlaying(true);
        isPlayingRef.current = true;
        clearInteractionUnlock();

        if (withFadeIn) {
          startFadeIn(audio);
        } else {
          audio.volume = getTargetVolume();
        }
        return true;
      } catch {
        if (reqId === playRequestIdRef.current) {
          setIsPlaying(false);
          isPlayingRef.current = false;
          // Ensure volume is restored cleanly even if play was blocked
          audio.volume = getTargetVolume();
        }
        return false;
      }
    },
    [clearFade, clearInteractionUnlock, getTargetVolume, startFadeIn]
  );

  const loadAndPlayTrack = useCallback(
    async (index: number, shouldPlay = true, withFadeIn = false) => {
      const safeIndex = (index + PLAYLIST.length) % PLAYLIST.length;
      setCurrentTrackIndex(safeIndex);
      currentTrackIndexRef.current = safeIndex;
      setProgress(0);
      setDuration(0);

      try {
        localStorage.setItem("kimgatta_bgm_track", String(safeIndex));
      } catch {
        // ignore
      }

      const audio = audioRef.current;
      if (!audio) return;

      clearFade();
      audio.pause();
      audio.src = PLAYLIST[safeIndex].src;
      audio.currentTime = 0;
      audio.load();
      audio.volume = getTargetVolume();

      if (shouldPlay) {
        try {
          localStorage.removeItem("kimgatta_bgm_paused_by_user");
        } catch {
          // ignore
        }
        await playCurrentAudio(withFadeIn);
      }
    },
    [clearFade, getTargetVolume, playCurrentAudio]
  );

  // Restore saved settings & initialize gentle autoplay on mount
  useEffect(() => {
    let initialTrack = 0;
    let userPaused = false;

    try {
      const savedVolume = localStorage.getItem("kimgatta_bgm_volume");
      if (savedVolume !== null) {
        const parsed = parseFloat(savedVolume);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setVolume(parsed);
          volumeRef.current = parsed;
        }
      }

      const savedTrack = localStorage.getItem("kimgatta_bgm_track");
      if (savedTrack !== null) {
        const parsed = parseInt(savedTrack, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < PLAYLIST.length) {
          initialTrack = parsed;
          setCurrentTrackIndex(parsed);
          currentTrackIndexRef.current = parsed;
        }
      }

      userPaused = localStorage.getItem("kimgatta_bgm_paused_by_user") === "true";
    } catch {
      // ignore
    }

    const audio = audioRef.current;
    if (audio) {
      audio.src = PLAYLIST[initialTrack].src;
      audio.volume = volumeRef.current;
      audio.load();
    }

    if (!userPaused) {
      // Try immediate autoplay with gentle fade-in; if blocked by browser, unlock on first interaction
      playCurrentAudio(true).then((started) => {
        if (started) return;

        const handleFirstInteraction = (e: Event) => {
          if (panelRef.current && panelRef.current.contains(e.target as Node)) {
            return;
          }
          playCurrentAudio(true);
        };

        window.addEventListener("pointerdown", handleFirstInteraction, {
          capture: true,
          passive: true,
        });
        window.addEventListener("keydown", handleFirstInteraction, {
          capture: true,
          passive: true,
        });
        window.addEventListener("touchstart", handleFirstInteraction, {
          capture: true,
          passive: true,
        });

        unlockCleanupRef.current = () => {
          window.removeEventListener("pointerdown", handleFirstInteraction, {
            capture: true,
          });
          window.removeEventListener("keydown", handleFirstInteraction, {
            capture: true,
          });
          window.removeEventListener("touchstart", handleFirstInteraction, {
            capture: true,
          });
        };
      });
    }

    return () => {
      clearFade();
      clearInteractionUnlock();
    };
  }, [clearFade, clearInteractionUnlock, playCurrentAudio]);

  // Sync volume immediately when user drags slider or toggles mute
  useEffect(() => {
    volumeRef.current = volume;
    isMutedRef.current = isMuted;
    if (audioRef.current && !fadeIntervalRef.current) {
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

  // Audio event listeners (progress, cyclic next-track on ended, safety volume check)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlaying = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
      // Guarantee audible volume if fade-in is not active
      if (!fadeIntervalRef.current) {
        audio.volume = getTargetVolume();
      }
    };

    const onPause = () => {
      // Only reflect paused state if it wasn't triggered mid-switch
      if (audio.ended) return;
      setIsPlaying(false);
      isPlayingRef.current = false;
    };

    const onEnded = () => {
      // Automatically cycle to next track (wraps from track 5 back to track 1) without zeroing volume
      const nextIdx = (currentTrackIndexRef.current + 1) % PLAYLIST.length;
      loadAndPlayTrack(nextIdx, true, false);
    };

    const onError = () => {
      if (isPlayingRef.current) {
        const nextIdx = (currentTrackIndexRef.current + 1) % PLAYLIST.length;
        loadAndPlayTrack(nextIdx, true, false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [getTargetVolume, loadAndPlayTrack]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      playRequestIdRef.current += 1;
      clearFade();
      clearInteractionUnlock();
      audio.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      try {
        localStorage.setItem("kimgatta_bgm_paused_by_user", "true");
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem("kimgatta_bgm_paused_by_user");
      } catch {
        // ignore
      }
      playCurrentAudio(true);
    }
  };

  const handleNextTrack = () => {
    loadAndPlayTrack(currentTrackIndex + 1, isPlaying, false);
  };

  const handlePrevTrack = () => {
    loadAndPlayTrack(currentTrackIndex - 1, isPlaying, false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearFade();
    const val = parseFloat(e.target.value);
    setVolume(val);
    volumeRef.current = val;
    if (isMuted && val > 0) {
      setIsMuted(false);
      isMutedRef.current = false;
    }
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    try {
      localStorage.setItem("kimgatta_bgm_volume", String(val));
    } catch {
      // ignore
    }
  };

  const toggleMute = () => {
    clearFade();
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volumeRef.current;
      }
      return next;
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const displayVolumePercent = Math.round((isMuted ? 0 : volume) * 100);

  return (
    <div ref={panelRef} className="relative inline-flex items-center">
      {/* Native Audio Element (src managed imperatively for seamless gapless track transitions) */}
      <audio ref={audioRef} preload="auto" />

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
                isPlaying
                  ? "h-full animate-[pulse_0.6s_ease-in-out_infinite]"
                  : "h-1 bg-slate-600"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-neon-pink transition-all duration-150 ${
                isPlaying
                  ? "h-2/3 animate-[pulse_0.4s_ease-in-out_infinite_0.1s]"
                  : "h-1 bg-slate-600"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-neon-green transition-all duration-150 ${
                isPlaying
                  ? "h-4/5 animate-[pulse_0.7s_ease-in-out_infinite_0.2s]"
                  : "h-1 bg-slate-600"
              }`}
            />
          </div>

          {/* Desktop Track Indicator */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-chakra tracking-wider text-slate-300 group-hover:text-white">
            <span
              className={
                isPlaying ? "text-neon-cyan font-bold" : "text-slate-400"
              }
            >
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
            <div className="flex items-center gap-1.5">
              <span
                title="전곡 순환 반복 재생 활성화됨"
                className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
              >
                <Repeat className="w-2.5 h-2.5" />
                <span>LOOP</span>
              </span>
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
          </div>

          {/* Current Track Display */}
          <div className="rounded-xl border border-white/10 bg-black/60 p-2.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-neon-pink font-bold">
                {currentTrack.genre}
              </span>
              <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400 border border-white/10">
                0{currentTrackIndex + 1}/0{PLAYLIST.length} ·{" "}
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
                    width: `${
                      duration > 0 ? (progress / duration) * 100 : 0
                    }%`,
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
            <div className="flex items-center gap-1.5">
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
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="볼륨 조절"
                className="w-16 sm:w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[9px] text-cyan-300/80 w-7 text-right tabular-nums">
                {displayVolumePercent}%
              </span>
            </div>
          </div>

          {/* Playlist selector (5 Tracks Cyclic) */}
          <div className="border-t border-cyan-500/20 pt-2 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              // PLAYLIST ({PLAYLIST.length} TRACKS · CYCLIC)
            </p>
            <div className="space-y-1 max-h-36 overflow-y-auto cyber-scrollbar pr-0.5">
              {PLAYLIST.map((track, idx) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => loadAndPlayTrack(idx, true, false)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] flex items-center justify-between transition-all cursor-pointer ${
                    currentTrackIndex === idx
                      ? "bg-cyan-500/20 text-neon-cyan border border-cyan-400/50 font-bold shadow-[0_0_8px_rgba(0,243,255,0.2)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className="truncate">
                    0{idx + 1}. {track.title}
                  </span>
                  <span className="text-[9px] text-slate-400 shrink-0 ml-1">
                    {track.artist}
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
