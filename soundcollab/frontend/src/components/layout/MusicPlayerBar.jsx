import { usePlayer } from '../../context/PlayerContext';
import CoverArt from '../music/CoverArt';
import WaveformVisual from '../music/WaveformVisual';
import FullPlayerModal from '../music/FullPlayerModal';
import QueueDrawer from './QueueDrawer';

function formatTime(sec) {
  if (!sec || !Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayerBar() {
  const {
    track, isPlaying, isShuffle, progress, duration, volume, queue,
    togglePlay, skipNext, skipPrev, seek, setVolume, openFullPlayer, setShowQueue, toggleShuffle,
  } = usePlayer();

  if (!track) {
    return (
      <footer className="sticky bottom-0 z-40 border-t border-white/[0.06] glass-strong px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 text-sm text-text-secondary">
          Select a track to play
        </div>
      </footer>
    );
  }

  const handleSeekRatio = (ratio) => {
    if (duration > 0) seek(ratio * duration);
  };

  return (
    <>
      <QueueDrawer />
      <footer className="sticky bottom-0 z-40 border-t border-white/[0.06] glass-strong">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-[1fr_2fr_1fr] md:gap-4 md:py-2">
          <button type="button" onClick={openFullPlayer} className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-80">
            <CoverArt seed={track.id} type={track.type} coverUrl={track.coverUrl} size="sm" className="!rounded-xl" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{track.title}</p>
              <span className="truncate text-xs text-text-secondary">{track.artist}</span>
            </div>
          </button>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={`transition ${isShuffle ? 'text-accent' : 'text-text-secondary hover:text-accent'}`}
                aria-label="Shuffle"
                title="Shuffle"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                </svg>
              </button>
              <button onClick={skipPrev} className="text-text-secondary transition hover:text-accent" aria-label="Previous">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" /></svg>
              </button>
              <button onClick={togglePlay} className={`play-btn h-10 w-10 ${isPlaying ? 'play-btn-pulse' : ''}`} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                  <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
                )}
              </button>
              <button onClick={skipNext} className="text-text-secondary transition hover:text-accent" aria-label="Next">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18h2V6h-2v12zm-11-7 8.5-6v12l-8.5-6z" /></svg>
              </button>
            </div>

            <div className="flex w-full max-w-lg items-center gap-2">
              <span className="w-8 text-[10px] tabular-nums text-text-secondary">{formatTime(progress)}</span>
              <WaveformVisual
                seed={track.id}
                audioUrl={track.audioUrl}
                active={isPlaying}
                variant="player"
                progress={progress}
                duration={duration}
                onSeek={handleSeekRatio}
                className="!h-8"
              />
              <span className="w-8 text-[10px] tabular-nums text-text-secondary">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="hidden items-center justify-end gap-3 md:flex">
            <button
              onClick={() => setShowQueue(true)}
              className="btn-ghost !px-2 !text-xs"
              title="Queue"
            >
              Queue ({queue.length})
            </button>
            <button onClick={openFullPlayer} className="text-text-secondary transition hover:text-accent" title="Expand">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
              </svg>
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full accent-accent"
            />
          </div>
        </div>
      </footer>
      <FullPlayerModal />
    </>
  );
}
