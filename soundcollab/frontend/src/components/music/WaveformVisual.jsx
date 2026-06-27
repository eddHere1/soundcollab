import { useWaveform } from '../../hooks/useWaveform';
import { getWaveformBars } from '../../utils/coverArt';

export default function WaveformVisual({
  seed,
  audioUrl,
  active = false,
  className = '',
  variant = 'default',
  progress = 0,
  duration = 0,
  onSeek,
  barCount,
}) {
  const count = barCount || (variant === 'hero' ? 48 : variant === 'player' ? 64 : 32);
  const { bars } = useWaveform(audioUrl, seed, count);
  const fallback = getWaveformBars(seed, count);
  const displayBars = bars?.length === count ? bars : fallback;

  const progressRatio = duration > 0 ? Math.min(1, progress / duration) : 0;
  const playedBars = Math.floor(progressRatio * displayBars.length);

  if (variant === 'player') {
    return (
      <div
        className={`flex h-8 flex-1 items-end gap-[1px] ${onSeek ? 'cursor-pointer' : ''} ${className}`}
        onClick={onSeek ? (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          onSeek(ratio);
        } : undefined}
        role={onSeek ? 'slider' : undefined}
        aria-valuenow={progress}
        aria-valuemax={duration}
      >
        {displayBars.map((h, i) => {
          const isPlayed = i < playedBars;
          const isCurrent = i === playedBars && active;
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-colors duration-75 ${
                isPlayed || isCurrent
                  ? 'bg-gradient-to-t from-accent to-cyan'
                  : 'bg-white/15'
              }`}
              style={{
                height: `${Math.max(12, h * 0.75)}%`,
                opacity: isCurrent ? 1 : isPlayed ? 0.9 : 0.5,
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-end justify-center gap-[2px] ${variant === 'hero' ? 'h-24' : 'h-12'} ${className}`}>
      {displayBars.map((h, i) => {
        const isPlayed = duration > 0 ? i / displayBars.length <= progressRatio : active;
        return (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all duration-150 ${
              isPlayed && active
                ? 'bg-gradient-to-t from-accent to-cyan'
                : variant === 'hero'
                  ? 'bg-accent/30'
                  : 'bg-white/20'
            }`}
            style={{
              height: `${h}%`,
              opacity: variant === 'hero' && !active ? 0.4 + (i % 5) * 0.12 : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
