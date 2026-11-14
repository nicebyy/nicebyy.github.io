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
  Shuffle,
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
  {
    id: "ghostrifter-neon-drive",
    title: "Neon Drive",
    artist: "Ghostrifter Official",
    src: "/audio/ghostrifter-neon-drive.mp3",
    genre: "Driving Synthwave",
    license: "CC BY-ND 3.0",
  },
  {
    id: "jiglr-cyberpunk",
    title: "Cyberpunk",
    artist: "jiglr",
    src: "/audio/jiglr-cyberpunk.mp3",
    genre: "Retro Cyberpunk",
    license: "CC BY 3.0",
  },
  {
    id: "libroru-80s-synth",
    title: "Stranger 80s",
    artist: "Libroru",
    src: "/audio/libroru-80s-synth.mp3",
    genre: "Retro Synthwave",
    license: "Creative Commons",
  },
  {
    id: "demetr-ozone-cloud",
    title: "Ozone Cloud",
    artist: "Demetr",
    src: "/audio/demetr-ozone-cloud.mp3",
    genre: "Dark Synthwave",
    license: "Creative Commons",
  },
  {
    id: "rexlambo-moonlight",
    title: "Moonlight",
    artist: "Rexlambo",
    src: "/audio/rexlambo-moonlight.mp3",
    genre: "Dreamy Synthwave",
    license: "CC BY 3.0",
  },
  {
    id: "jiglr-night-rider",
    title: "Night Rider",
    artist: "jiglr",
    src: "/audio/jiglr-night-rider.mp3",
    genre: "Outrun Synthwave",
    license: "CC BY 3.0",
  },
  {
    id: "jiglr-miami-life",
    title: "Miami Life",
    artist: "jiglr",
    src: "/audio/jiglr-miami-life.mp3",
    genre: "Retro Synthwave",
    license: "CC BY 3.0",
  },
  {
    id: "jiglr-odyssey",
    title: "Odyssey",
    artist: "jiglr",
    src: "/audio/jiglr-odyssey.mp3",
    genre: "Space Synthwave",
    license: "CC BY 3.0",
  },
  {
    id: "ghostrifter-downtown-glow",
    title: "Downtown Glow",
    artist: "Ghostrifter & Devyzed",
    src: "/audio/ghostrifter-downtown-glow.mp3",
    genre: "Retrowave Chill",
    license: "CC BY-SA 3.0",
  },
  {
    id: "ghostrifter-fast-lane",
    title: "Fast Lane",
    artist: "Ghostrifter & Devyzed",
    src: "/audio/ghostrifter-fast-lane.mp3",
    genre: "Outrun Synthwave",
    license: "CC BY-SA 3.0",
  },
  {
    id: "ghostrifter-sundown-drive",
    title: "Sundown Drive",
    artist: "Ghostrifter Official",
    src: "/audio/ghostrifter-sundown-drive.mp3",
    genre: "Driving Synthwave",
    license: "CC BY-SA 3.0",
  },
  {
    id: "aries-beats-outrun",
    title: "Outrun",
    artist: "Aries Beats",
    src: "/audio/aries-beats-outrun.mp3",
    genre: "80s Outrun Synth",
    license: "CC BY-SA 3.0",
  },
  {
    id: "aries-beats-neowise",
    title: "Neowise",
    artist: "Aries Beats",
    src: "/audio/aries-beats-neowise.mp3",
    genre: "Space Synthwave",
    license: "CC BY-SA 3.0",
  },
  {
    id: "electronic-senses-robotik-love",
    title: "Robotik Love",
    artist: "Electronic Senses",
    src: "/audio/electronic-senses-robotik-love.mp3",
    genre: "Cyber Electro Synth",
    license: "CC BY-SA 3.0",
  },
  {
    id: "electronic-senses-yesterday",
    title: "Yesterday",
    artist: "Electronic Senses",
    src: "/audio/electronic-senses-yesterday.mp3",
    genre: "Dark Retrowave",
    license: "CC BY-SA 3.0",
  },
];

// Gentle, calm ambient default volume (12%) so reading remains comfortable
const DEFAULT_BGM_VOLUME = 0.12;
const FADE_IN_DURATION_MS = 1200;

export function CyberBgmPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(true);
  const [volume, setVolume] = useState(DEFAULT_BGM_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const isSeekingRef = useRef(false);

  // Refs to prevent stale closures inside event listeners & fade intervals
  const volumeRef = useRef(DEFAULT_BGM_VOLUME);
  const isMutedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const isShuffleRef = useRef(true);
  const historyStackRef = useRef<number[]>([]);
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

  // Helper to pick next random track without immediate repetition
  const getNextRandomTrackIndex = useCallback((): number => {
    const currentIdx = currentTrackIndexRef.current;
    const total = PLAYLIST.length;
    if (total <= 1) return 0;

    // Avoid the current track and recent history (up to half the playlist size)
    const recent = historyStackRef.current.slice(-Math.floor(total / 2));
    const excluded = new Set([currentIdx, ...recent]);
    let candidates = Array.from({ length: total }, (_, i) => i).filter(
      (i) => !excluded.has(i)
    );

    if (candidates.length === 0) {
      candidates = Array.from({ length: total }, (_, i) => i).filter(
        (i) => i !== currentIdx
      );
    }
    if (candidates.length === 0) return 0;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, []);

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
    async (
      index: number,
      shouldPlay = true,
      withFadeIn = false,
      recordHistory = true
    ) => {
      const safeIndex = (index + PLAYLIST.length) % PLAYLIST.length;
      const prevIndex = currentTrackIndexRef.current;

      if (recordHistory && prevIndex !== safeIndex) {
        historyStackRef.current.push(prevIndex);
        if (historyStackRef.current.length > 20) {
          historyStackRef.current.shift();
        }
      }

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

      const savedShuffle = localStorage.getItem("kimgatta_bgm_shuffle");
      if (savedShuffle !== null) {
        const parsedShuffle = savedShuffle === "true";
        setIsShuffle(parsedShuffle);
        isShuffleRef.current = parsedShuffle;
      } else {
        setIsShuffle(true);
        isShuffleRef.current = true;
      }

      const savedTrack = localStorage.getItem("kimgatta_bgm_track");
      if (savedTrack !== null) {
        const parsed = parseInt(savedTrack, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < PLAYLIST.length) {
          initialTrack = parsed;
          setCurrentTrackIndex(parsed);
          currentTrackIndexRef.current = parsed;
        }
      } else if (isShuffleRef.current) {
        const randomInit = Math.floor(Math.random() * PLAYLIST.length);
        initialTrack = randomInit;
        setCurrentTrackIndex(randomInit);
        currentTrackIndexRef.current = randomInit;
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
      if (isSeekingRef.current) return;
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
      if (isShuffleRef.current) {
        const nextIdx = getNextRandomTrackIndex();
        loadAndPlayTrack(nextIdx, true, false, true);
      } else {
        const nextIdx = (currentTrackIndexRef.current + 1) % PLAYLIST.length;
        loadAndPlayTrack(nextIdx, true, false, true);
      }
    };

    const onError = () => {
      if (isPlayingRef.current) {
        if (isShuffleRef.current) {
          const nextIdx = getNextRandomTrackIndex();
          loadAndPlayTrack(nextIdx, true, false, true);
        } else {
          const nextIdx = (currentTrackIndexRef.current + 1) % PLAYLIST.length;
          loadAndPlayTrack(nextIdx, true, false, true);
        }
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
  }, [getNextRandomTrackIndex, getTargetVolume, loadAndPlayTrack]);

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

  const toggleShuffle = () => {
    setIsShuffle((prev) => {
      const next = !prev;
      isShuffleRef.current = next;
      try {
        localStorage.setItem("kimgatta_bgm_shuffle", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleNextTrack = () => {
    if (isShuffleRef.current) {
      const nextIdx = getNextRandomTrackIndex();
      loadAndPlayTrack(nextIdx, isPlaying, false, true);
    } else {
      const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
      loadAndPlayTrack(nextIdx, isPlaying, false, true);
    }
  };

  const handlePrevTrack = () => {
    if (historyStackRef.current.length > 0) {
      const prevIdx = historyStackRef.current.pop()!;
      loadAndPlayTrack(prevIdx, isPlaying, false, false);
    } else {
      const prevIdx = isShuffleRef.current
        ? getNextRandomTrackIndex()
        : (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
      loadAndPlayTrack(prevIdx, isPlaying, false, false);
    }
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

  const calculateSeekTime = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current || duration <= 0) return 0;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handleSeekStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    e.preventDefault();
    setIsSeeking(true);
    isSeekingRef.current = true;
    const targetTime = calculateSeekTime(e.clientX);
    setProgress(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleSeekMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current || duration <= 0) return;
    const targetTime = calculateSeekTime(e.clientX);
    setProgress(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleSeekEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    setIsSeeking(false);
    isSeekingRef.current = false;
    const targetTime = calculateSeekTime(e.clientX);
    setProgress(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
  };

  const handleSeekKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    let nextTime = progress;
    if (e.key === "ArrowLeft") {
      nextTime = Math.max(0, progress - 5);
    } else if (e.key === "ArrowRight") {
      nextTime = Math.min(duration, progress + 5);
    } else if (e.key === "Home") {
      nextTime = 0;
    } else if (e.key === "End") {
      nextTime = duration;
    } else {
      return;
    }
    e.preventDefault();
    setProgress(nextTime);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
  };

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

          {/* Desktop Track Indicator (Only expanded on 2xl+ to prevent header collision) */}
          <span className="hidden 2xl:inline-flex items-center gap-1.5 text-[11px] font-chakra tracking-wider text-slate-300 group-hover:text-white">
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
        <div className="fixed right-3 top-[4.25rem] sm:absolute sm:top-full sm:right-0 sm:mt-2 w-[calc(100vw-1.5rem)] max-w-[21rem] sm:w-[22.5rem] rounded-2xl border border-cyan-500/50 bg-[#070b14]/95 backdrop-blur-xl p-3.5 sm:p-4 shadow-[0_0_25px_rgba(0,243,255,0.35)] z-50 space-y-3 font-mono animate-in fade-in zoom-in-95 duration-150">
          {/* Header with Cyber Status */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 gap-2">
            <div className="flex items-center gap-1.5 min-w-0 shrink-0">
              <Radio className="w-3.5 h-3.5 text-neon-cyan animate-pulse shrink-0" />
              <span className="text-[11px] font-chakra tracking-wider text-neon-cyan font-bold uppercase whitespace-nowrap">
                // CYBER_AUDIO_DECK
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleShuffle}
                title={
                  isShuffle
                    ? "랜덤 셔플 활성화됨 (클릭 시 순차 재생으로 전환)"
                    : "순차 순환 재생 활성화됨 (클릭 시 랜덤 셔플로 전환)"
                }
                className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-chakra tracking-wider border transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                  isShuffle
                    ? "bg-pink-500/20 text-neon-pink border-pink-500/50 shadow-[0_0_8px_rgba(255,0,127,0.3)] hover:bg-pink-500/30"
                    : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
                }`}
              >
                {isShuffle ? (
                  <>
                    <Shuffle className="w-2.5 h-2.5" />
                    <span>SHUFFLE</span>
                  </>
                ) : (
                  <>
                    <Repeat className="w-2.5 h-2.5" />
                    <span>LOOP</span>
                  </>
                )}
              </button>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border whitespace-nowrap ${
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
            <div className="flex items-center justify-between text-[10px] text-slate-400 gap-2">
              <span className="text-neon-pink font-bold truncate">
                {currentTrack.genre}
              </span>
              <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400 border border-white/10 shrink-0 whitespace-nowrap">
                {String(currentTrackIndex + 1).padStart(2, "0")}/
                {String(PLAYLIST.length).padStart(2, "0")} ·{" "}
                {currentTrack.license}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Disc3
                className={`w-5 h-5 text-neon-cyan shrink-0 ${
                  isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                }`}
              />
              <div className="min-w-0 flex-1">
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
              {/* Interactive Progress Bar Track Container */}
              <div
                ref={progressBarRef}
                role="slider"
                tabIndex={0}
                aria-label="재생 구간 탐색 (클릭 또는 드래그로 원하는 구간 이동)"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(progress)}
                aria-valuetext={`${formatTime(progress)} / ${formatTime(duration)}`}
                onPointerDown={handleSeekStart}
                onPointerMove={handleSeekMove}
                onPointerUp={handleSeekEnd}
                onPointerCancel={handleSeekEnd}
                onKeyDown={handleSeekKeyDown}
                title="클릭하거나 드래그하여 원하는 재생 구간으로 이동"
                className="relative group py-2 -my-1 cursor-pointer select-none touch-none outline-none"
              >
                {/* Background Rail */}
                <div className="w-full h-1.5 group-hover:h-2 group-focus-visible:h-2 bg-white/10 rounded-full overflow-hidden transition-all duration-150 border border-white/5 group-hover:border-cyan-500/30">
                  {/* Filled Gradient Bar */}
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 rounded-full transition-[width] duration-75"
                    style={{
                      width: `${
                        duration > 0 ? Math.min((progress / duration) * 100, 100) : 0
                      }%`,
                    }}
                  />
                </div>

                {/* Draggable Cyber Neon Handle Thumb */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-neon-cyan shadow-[0_0_10px_#00f3ff] transition-opacity pointer-events-none ${
                    isSeeking ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                  style={{
                    left: `${
                      duration > 0
                        ? Math.min(Math.max((progress / duration) * 100, 0), 100)
                        : 0
                    }%`,
                  }}
                />
              </div>

              {/* Timestamp Readout */}
              <div className="flex justify-between text-[9px] text-slate-400 tabular-nums">
                <span className={isSeeking ? "text-neon-cyan font-bold" : ""}>
                  {formatTime(progress)}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevTrack}
                title="이전 곡 (히스토리 역방향)"
                className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/15 text-slate-300 hover:text-neon-cyan transition-all cursor-pointer active:scale-95"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? "일시정지" : "재생"}
                className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
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
                title={isShuffle ? "다음 곡 (무작위 셔플)" : "다음 곡"}
                className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/15 text-slate-300 hover:text-neon-cyan transition-all cursor-pointer active:scale-95"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleShuffle}
                title={
                  isShuffle
                    ? "랜덤 셔플 켜짐 (클릭 시 순차 재생으로 전환)"
                    : "순차 순환 재생 (클릭 시 랜덤 셔플 활성화)"
                }
                className={`p-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                  isShuffle
                    ? "border-pink-500/60 bg-pink-500/20 text-neon-pink shadow-[0_0_8px_rgba(255,0,127,0.35)]"
                    : "border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/15 text-slate-400 hover:text-neon-cyan"
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 shrink-0">
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

          {/* Playlist selector (20 Tracks) */}
          <div className="border-t border-cyan-500/20 pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider px-0.5">
              <span className="font-chakra font-semibold text-slate-300 whitespace-nowrap">
                // TRACKLIST ({PLAYLIST.length})
              </span>
              <span
                className={`text-[9px] font-chakra font-bold tracking-wider px-1.5 py-0.5 rounded border whitespace-nowrap ${
                  isShuffle
                    ? "text-neon-pink bg-pink-500/10 border-pink-500/30"
                    : "text-neon-cyan bg-cyan-500/10 border-cyan-500/30"
                }`}
              >
                {isShuffle ? "RANDOM SHUFFLE" : "CYCLIC LOOP"}
              </span>
            </div>

            {/* Column Header */}
            <div className="grid grid-cols-[1.5rem_1fr_6.5rem] items-center gap-2 px-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider border-b border-white/5 pb-1">
              <span>#</span>
              <span>TITLE</span>
              <span className="text-right">ARTIST</span>
            </div>

            <div className="space-y-1 max-h-48 sm:max-h-56 overflow-y-auto cyber-scrollbar pr-1">
              {PLAYLIST.map((track, idx) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => loadAndPlayTrack(idx, true, false, true)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] grid grid-cols-[1.5rem_1fr_6.5rem] items-center gap-2 transition-all cursor-pointer group ${
                    currentTrackIndex === idx
                      ? "bg-cyan-500/20 text-neon-cyan border border-cyan-400/50 font-bold shadow-[0_0_8px_rgba(0,243,255,0.2)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      currentTrackIndex === idx
                        ? "text-neon-cyan font-bold"
                        : "text-slate-500 group-hover:text-cyan-400"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}.
                  </span>
                  <span
                    className={`truncate font-medium ${
                      currentTrackIndex === idx
                        ? "text-white font-bold"
                        : "text-slate-300 group-hover:text-white"
                    }`}
                  >
                    {track.title}
                  </span>
                  <span
                    className={`text-[9px] text-right truncate tabular-nums ${
                      currentTrackIndex === idx
                        ? "text-cyan-300 font-semibold"
                        : "text-slate-500 group-hover:text-slate-400"
                    }`}
                  >
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
