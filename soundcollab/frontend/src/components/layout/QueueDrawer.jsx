import { usePlayer, postToTrack } from '../../context/PlayerContext';
import CoverArt from '../music/CoverArt';

export default function QueueDrawer() {
  const { track, queue, isPlaying, showQueue, setShowQueue, playTrack, togglePlay } = usePlayer();

  if (!showQueue) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowQueue(false)} />
      <aside className="fixed inset-x-0 bottom-0 top-14 z-[110] flex max-h-[85dvh] flex-col glass-strong border-t border-white/10 shadow-glow animate-slide-up safe-bottom md:inset-x-auto md:bottom-20 md:left-auto md:right-0 md:top-16 md:max-h-none md:w-full md:max-w-sm md:border-l md:border-t-0">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="font-heading font-semibold">Queue</h3>
          <button onClick={() => setShowQueue(false)} className="btn-ghost touch-target !p-2" aria-label="Close queue">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {queue.length === 0 ? (
            <p className="p-4 text-center text-sm text-text-secondary">Queue is empty</p>
          ) : queue.map((item, i) => {
            const isActive = track?.id === item.id;
            const playing = isActive && isPlaying;
            return (
              <button
                key={`${item.id}-${i}`}
                onClick={() => {
                  playTrack(item, queue, false);
                  if (!playing) togglePlay();
                }}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition touch-target ${
                  isActive ? 'bg-accent/15' : 'hover:bg-white/5 active:bg-white/10'
                }`}
              >
                <CoverArt seed={item.id} type={item.type} coverUrl={item.coverUrl} size="sm" className="!h-10 !w-10 !rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isActive ? 'text-accent' : ''}`}>{item.title}</p>
                  <p className="truncate text-xs text-text-secondary">{item.artist}</p>
                </div>
                {playing && <span className="text-xs text-accent">▶</span>}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
