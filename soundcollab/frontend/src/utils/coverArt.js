const GRADIENTS = [
  ['#8B5CF6', '#0B0B0F'],
  ['#22D3EE', '#15151D'],
  ['#7C3AED', '#1E1E28'],
  ['#6366F1', '#0B0B0F'],
  ['#A855F7', '#15151D'],
  ['#06B6D4', '#1E1E28'],
  ['#8B5CF6', '#22D3EE'],
  ['#4ADE80', '#15151D'],
];

export function getCoverGradient(seed) {
  const str = String(seed || 'default');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const [a, b] = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  return `linear-gradient(135deg, ${a} 0%, ${b} 70%)`;
}

export function getWaveformBars(seed, count = 24) {
  const str = String(seed || 'x');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Array.from({ length: count }, (_, i) => {
    const h = 20 + ((hash >> (i % 8)) & 7) * 8 + (i % 5) * 6;
    return Math.min(100, h);
  });
}
