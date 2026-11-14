export const API = 'http://localhost:3000/api';
export const SERVER_URL = 'http://localhost:3000';
export const imageUrl = (url?: string, name = '') => {
  if (url) return url.startsWith('http') ? url : `${SERVER_URL}${url}`;
  const lower = name.toLowerCase();
  const fallback = lower.includes('juice') ? 'photo-1600271886742-f049cd451bba'
    : lower.includes('tea') ? 'photo-1544787219-7f47ccb76574'
    : lower.includes('chip') ? 'photo-1566478989037-eec170784d0b'
    : lower.includes('biscuit') || lower.includes('chocolate') ? 'photo-1558961363-fa8fdf82db35'
    : 'photo-1542838132-92c53300491e';
  return `https://images.unsplash.com/${fallback}?auto=format&fit=crop&w=900&q=80`;
};
