import { usePlayer, postToTrack } from '../../context/PlayerContext';
import CoverArt from '../music/CoverArt';

export default function QueueDrawer() {
  const { track, queue, isPlaying, showQueue, setShowQueue, playTrack, togglePlay } = usePlayer();

  if (!showQueue) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowQueue(false)} />
      <aside className="fixed bottom-[72px] right-0 top-16 z-[110] w-full max-w-sm glass-strong border-l border-white/10 shadow-glow flex flex-col animate-slide-up md:bottom-[80px]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="font-heading font-semibold">Queue</h3>
          <button onClick={() => setShowQueue(false)} className="btn-ghost !p-1">✕</button>
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
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                  isActive ? 'bg-accent/15' : 'hover:bg-white/5'
                }`}
              >
                <CoverArt seed={item.id} type={item.type} coverUrl={item.coverUrl} size="sm" className="!h-10 !w-10 !rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isActive ? 'text-accent' : ''}`}>{item.title}</p>
                  <p className="truncate text-xs text-text-secondary">{item.artist}</p>
                </div>
                {playing && (
                  <span className="text-xs text-accent">▶</span>
                )}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
