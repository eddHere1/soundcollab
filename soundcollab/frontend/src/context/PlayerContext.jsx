import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { mediaUrl } from '../api/client';

const PlayerContext = createContext(null);

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function postToTrack(post) {
  return {
    id: post.id,
    title: post.title,
    artist: post.username,
    audioUrl: mediaUrl(post.audio_url),
    coverUrl: post.cover_image ? mediaUrl(post.cover_image) : null,
    type: post.type,
    userId: post.user_id,
    profileImage: post.profile_image,
    post,
  };
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);
  const [track, setTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [fullScreen, setFullScreen] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.audioUrl) return;

    audio.src = track.audioUrl;
    audio.load();
    setProgress(0);
    setDuration(0);

    const onCanPlay = () => {
      if (isPlayingRef.current) audio.play().catch(() => setIsPlaying(false));
    };
    audio.addEventListener('canplay', onCanPlay);
    return () => audio.removeEventListener('canplay', onCanPlay);
  }, [track?.id, track?.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (isPlaying) {
      if (audio.readyState >= 2) audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, track?.id]);

  const playTrack = useCallback((newTrack, newQueue = [], openFull = false) => {
    setTrack(newTrack);
    setQueue(newQueue.length ? newQueue : [newTrack]);
    setIsPlaying(true);
    if (openFull) setFullScreen(true);

    try {
      const key = 'sc_recent';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      const next = [newTrack.id, ...prev.filter((id) => id !== newTrack.id)].slice(0, 30);
      localStorage.setItem(key, JSON.stringify(next));
    } catch { /* ignore */ }

    const token = localStorage.getItem('token');
    if (token && newTrack?.id) {
      fetch(`/api/posts/${newTrack.id}/play`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  }, []);

  const playPost = useCallback((post, postQueue = [], openFull = true) => {
    const tracks = postQueue.map(postToTrack);
    const t = postToTrack(post);
    playTrack(t, tracks.length ? tracks : [t], openFull);
  }, [playTrack]);

  const addToQueue = useCallback((newTrack) => {
    setQueue((q) => (q.some((t) => t.id === newTrack.id) ? q : [...q, newTrack]));
  }, []);

  const addPostToQueue = useCallback((post) => {
    addToQueue(postToTrack(post));
  }, [addToQueue]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((on) => {
      if (!on) {
        setQueue((q) => {
          if (q.length < 2) return q;
          const current = track ? q.find((t) => t.id === track.id) : null;
          const rest = shuffleArray(q.filter((t) => t.id !== track?.id));
          return current ? [current, ...rest] : shuffleArray(q);
        });
      }
      return !on;
    });
  }, [track]);

  const togglePlay = useCallback(() => {
    if (!track) return;
    setIsPlaying((p) => !p);
  }, [track]);

  const skipNext = useCallback(() => {
    if (!track || queue.length < 2) {
      setIsPlaying(false);
      return;
    }
    const idx = queue.findIndex((t) => t.id === track.id);
    let next;
    if (isShuffle) {
      const remaining = queue.filter((t) => t.id !== track.id);
      next = remaining[Math.floor(Math.random() * remaining.length)];
    } else {
      next = queue[(idx + 1) % queue.length];
    }
    setTrack(next);
    setIsPlaying(true);
  }, [track, queue, isShuffle]);

  const skipPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }
    if (!track || queue.length < 2) return;
    const idx = queue.findIndex((t) => t.id === track.id);
    const prev = queue[(idx - 1 + queue.length) % queue.length];
    setTrack(prev);
    setIsPlaying(true);
  }, [track, queue]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setProgress(time);
    }
  }, []);

  const openFullPlayer = useCallback(() => {
    if (track) setFullScreen(true);
  }, [track]);

  const closeFullPlayer = useCallback(() => setFullScreen(false), []);

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) setProgress(audio.currentTime);
  };

  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) setDuration(audio.duration);
  };

  const onDurationChange = () => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) setDuration(audio.duration);
  };

  const onEnded = () => skipNext();

  return (
    <PlayerContext.Provider
      value={{
        track,
        queue,
        isPlaying,
        isShuffle,
        progress,
        duration,
        volume,
        fullScreen,
        showQueue,
        setShowQueue,
        playTrack,
        playPost,
        addToQueue,
        addPostToQueue,
        toggleShuffle,
        togglePlay,
        skipNext,
        skipPrev,
        seek,
        setVolume,
        setIsPlaying,
        openFullPlayer,
        closeFullPlayer,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onDurationChange={onDurationChange}
        onEnded={onEnded}
        preload="auto"
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
