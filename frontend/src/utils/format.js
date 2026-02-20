export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);
};

export const buildImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:image')) return url;

  const base = import.meta.env.VITE_API_HOST || 'http://localhost:5000';
  return `${base}${url}`;
};
