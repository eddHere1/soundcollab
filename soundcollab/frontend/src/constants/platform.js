/** Shared platform constants — content types, filters, and taxonomy */

export const GENRES = [
  'Trap', 'Drill', 'R&B', 'Hip-Hop', 'Pop', 'Lo-Fi', 'Afrobeats', 'EDM', 'Rock', 'Soul',
];

export const MOODS = [
  'Dark', 'Chill', 'Aggressive', 'Melodic', 'Emotional', 'Party', 'Ambient', 'Hard',
];

export const UPLOAD_TYPES = [
  { id: 'beat', label: 'Beat' },
  { id: 'song', label: 'Song' },
  { id: 'loop', label: 'Loop' },
  { id: 'hook', label: 'Hook' },
  { id: 'sample_pack', label: 'Sample Pack' },
  { id: 'drum_kit', label: 'Drum Kit' },
];

export const LOOKING_FOR = [
  'vocalist', 'rapper', 'producer', 'engineer', 'collab', 'feedback', 'mixer', 'songwriter',
];

export const SEARCH_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'song', label: 'Songs' },
  { id: 'beat', label: 'Beats' },
  { id: 'loop', label: 'Loops' },
  { id: 'hook', label: 'Hooks' },
  { id: 'artists', label: 'Artists' },
  { id: 'producer', label: 'Producers' },
  { id: 'engineer', label: 'Engineers' },
  { id: 'collab', label: 'Collabs' },
];

export const MARKETPLACE_CATEGORIES = [
  { id: 'beats', label: 'Beats' },
  { id: 'hooks', label: 'Hooks' },
  { id: 'loops', label: 'Loops' },
  { id: 'drum_kits', label: 'Drum Kits' },
  { id: 'mixing_mastering', label: 'Mixing / Mastering' },
  { id: 'songwriting', label: 'Songwriting' },
];

export const OPPORTUNITY_TYPES = [
  { id: 'need_rapper', label: 'Need Rapper', tag: 'Rapper' },
  { id: 'need_producer', label: 'Need Producer', tag: 'Producer' },
  { id: 'need_engineer', label: 'Need Engineer', tag: 'Engineer' },
  { id: 'open_verse', label: 'Open Verse Available', tag: 'Open Verse' },
  { id: 'paid_feature', label: 'Paid Feature Available', tag: 'Paid Feature' },
];

export const BADGE_LABELS = {
  prolific: 'Prolific Creator',
  trending: 'Trending',
  seller: 'Top Seller',
  collaborator: 'Collab King',
};
