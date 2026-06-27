import { Link } from 'react-router-dom';
import { usePlayer, postToTrack } from '../../context/PlayerContext';
import CoverArt from '../music/CoverArt';
import WaveformVisual from '../music/WaveformVisual';

export default function FeaturedBeats({ beats = [], loading }) {
  const { track, isPlaying, playTrack, togglePlay } = usePlayer();

  if (loading) {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-card" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card h-72 animate-pulse !bg-card/50" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayBeats = beats.slice(0, 8);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">Featured Beats</h2>
            <p className="section-subtitle">Hand-picked heat from underground producers</p>
          </div>
          <Link to="/marketplace" className="btn-ghost hidden text-sm sm:inline-flex">
            View all →
          </Link>
        </div>

        {displayBeats.length === 0 ? (
          <div className="glass-card mt-8 py-16 text-center text-text-secondary">
            No beats yet — be the first to upload.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {displayBeats.map((beat) => {
              const isActive = track?.id === beat.id;
              const playing = isActive && isPlaying;
              const queue = displayBeats.map(postToTrack);

              return (
                <div key={beat.id} className="group glass-card overflow-hidden !p-0">
                  <div className="relative">
                    <CoverArt seed={beat.id} type="beat" size="grid" className="!rounded-none !rounded-t-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                    <button
                      type="button"
                      onClick={() => (isActive ? togglePlay() : playTrack(postToTrack(beat), queue))}
                      className={`play-btn absolute bottom-4 right-4 h-12 w-12 transition-all duration-300 ${
                        playing ? 'opacity-100 play-btn-pulse' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                      }`}
                    >
                      {playing ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7L8 5z" />
                        </svg>
                      )}
                    </button>
                    {beat.price > 0 && (
                      <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-success backdrop-blur-sm">
                        ${Number(beat.price).toFixed(0)}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="truncate font-heading font-semibold">{beat.title}</p>
                    <Link to={`/profile/${beat.user_id}`} className="text-sm text-text-secondary hover:text-accent">
                      {beat.username}
                    </Link>
                    <WaveformVisual seed={beat.id} active={playing} className="mt-3 !h-8" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link to="/marketplace" className="btn-secondary">View all beats</Link>
        </div>
      </div>
    </section>
  );
}
