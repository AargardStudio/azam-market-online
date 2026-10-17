/** Convert common Pakistani phone formats to the E.164 format Supabase Auth requires. */
export const normalizePakistanPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('92')) return `+${digits}`;
  if (digits.startsWith('0')) return `+92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('3')) return `+92${digits}`;
  return value.trim().startsWith('+') ? `+${digits}` : '';
};

