import { useState, useEffect } from 'react';
import { analyzeAudioWaveform } from '../utils/waveformAnalysis';
import { getWaveformBars } from '../utils/coverArt';

/**
 * Loads real waveform bars from audio URL with fallback to seeded fake bars.
 */
export function useWaveform(audioUrl, seed, barCount = 64) {
  const [bars, setBars] = useState(() => getWaveformBars(seed, barCount));
  const [loading, setLoading] = useState(!!audioUrl);

  useEffect(() => {
    if (!audioUrl) {
      setBars(getWaveformBars(seed, barCount));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    analyzeAudioWaveform(audioUrl, barCount)
      .then((data) => {
        if (!cancelled) setBars(data);
      })
      .catch(() => {
        if (!cancelled) setBars(getWaveformBars(seed, barCount));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [audioUrl, seed, barCount]);

  return { bars, loading };
}
