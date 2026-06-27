import { getCoverGradient } from '../../utils/coverArt';

const sizes = {
  sm: 'h-14 w-14 rounded',
  md: 'h-40 w-full rounded-md',
  lg: 'h-full w-full',
  grid: 'aspect-square w-full rounded-md',
};

export default function CoverArt({ seed, type, coverUrl, size = 'md', className = '' }) {
  const gradient = getCoverGradient(`${seed}-${type}`);
  return (
    <div
      className={`relative shrink-0 overflow-hidden shadow-card ${sizes[size]} ${className}`}
      style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: gradient }}
    >
      {!coverUrl && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <svg className="h-1/3 w-1/3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        </div>
      )}
      {type && (
        <span className={`absolute bottom-1.5 left-1.5 pill ${type === 'beat' ? 'pill-beat' : 'pill-song'} text-[9px]`}>
          {type}
        </span>
      )}
    </div>
  );
}
