/** Decode audio and extract normalized amplitude bars for waveform UI */

const cache = new Map();

export async function analyzeAudioWaveform(audioUrl, barCount = 64) {
  const key = `${audioUrl}:${barCount}`;
  if (cache.has(key)) return cache.get(key);

  const promise = (async () => {
    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error('Failed to load audio');
    const buffer = await res.arrayBuffer();

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const decoded = await ctx.decodeAudioData(buffer.slice(0));
      const channel = decoded.getChannelData(0);
      const blockSize = Math.floor(channel.length / barCount);
      const bars = [];

      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        const start = i * blockSize;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channel[start + j] || 0);
        }
        bars.push(sum / blockSize);
      }

      const max = Math.max(...bars, 0.001);
      return bars.map((v) => Math.max(8, Math.round((v / max) * 100)));
    } finally {
      ctx.close().catch(() => {});
    }
  })();

  cache.set(key, promise);
  return promise;
}

export function clearWaveformCache() {
  cache.clear();
}
