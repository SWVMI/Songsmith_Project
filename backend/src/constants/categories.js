// Central list of music-related categories/skills.
// Keep this in sync with frontend/src/constants/categories.js
// Extensible: add new roles here as needed.
const CATEGORIES = [
  'Singer',
  'Vocalist',
  'Songwriter',
  'Lyricist',
  'Guitarist',
  'Bassist',
  'Pianist',
  'Keyboardist',
  'Drummer',
  'Percussionist',
  'Violinist',
  'Cellist',
  'Saxophonist',
  'Trumpeter',
  'Flutist',
  'Producer',
  'Composer',
  'Beat Maker',
  'DJ',
  'Rapper',
  'Music Director',
  'Session Musician',
  'Mixing Engineer',
  'Mastering Engineer',
  'Sound Engineer',
  'Audio Engineer',
  'Arranger',
];

// 'Other' is handled separately: users/posts may supply a custom category
// string that is not in this fixed list. isValidCategory allows any
// non-empty trimmed string of reasonable length so custom categories work,
// while EXPLORE/registration UIs primarily surface the curated list above.
const isValidCategoryString = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 60;
};

module.exports = { CATEGORIES, isValidCategoryString };
