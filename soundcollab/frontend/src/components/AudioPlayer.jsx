import { mediaUrl } from '../api/client';

export default function AudioPlayer({ src, title }) {
  if (!src) return null;
  return (
    <div className="rounded-lg bg-dark-900/60 p-3">
      <audio controls className="w-full" preload="metadata">
        <source src={mediaUrl(src)} />
        Your browser does not support audio playback.
      </audio>
      {title && <p className="mt-1 text-xs text-dark-400">{title}</p>}
    </div>
  );
}
