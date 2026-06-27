import { usePlayer } from '../../context/PlayerContext';
import CoverArt from './CoverArt';

export default function TrendingCard({ post, queue = [] }) {
  const { track, isPlaying, playPost, togglePlay } = usePlayer();
  const isActive = track?.id === post.id;
  const playing = isActive && isPlaying;

  const handleCardClick = () => {
    if (isActive) togglePlay();
    else playPost(post, queue.length ? queue : [post], true);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isActive) togglePlay();
    else playPost(post, queue.length ? queue : [post], true);
  };

  return (
    <div className="group w-[180px] shrink-0 cursor-pointer" onClick={handleCardClick}>
      <div className="glass-card overflow-hidden !p-0">
        <div className="relative">
          <CoverArt seed={post.id} type={post.type} size="md" className="!h-[180px] !rounded-b-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          <button
            onClick={handlePlay}
            className={`play-btn absolute bottom-3 right-3 h-12 w-12 transition-all duration-300 ${
              playing ? 'opacity-100 play-btn-pulse' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
            }`}
          >
            {playing ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
            )}
          </button>
        </div>
        <div className="p-3">
          <p className="truncate font-heading font-semibold">{post.title}</p>
          <p className="truncate text-sm text-text-secondary">{post.username}</p>
        </div>
      </div>
    </div>
  );
}
