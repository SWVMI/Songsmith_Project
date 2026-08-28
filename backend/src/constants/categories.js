
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


const isValidCategoryString = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 60;
};

module.exports = { CATEGORIES, isValidCategoryString };
