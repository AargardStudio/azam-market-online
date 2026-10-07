/**
 * Turn whatever a save/upload threw (Supabase PostgREST error, fetch failure,
 * plain Error, string) into a short message a vendor can act on.
 * The raw technical message is appended in brackets so it can be reported.
 */
export function describeError(err: unknown, fallback = 'Something went wrong.'): string {
  if (!err) return fallback;

  const e = err as {
    message?: string;
    code?: string;
    status?: number;
    details?: string;
    hint?: string;
    name?: string;
  };
  const raw = (typeof err === 'string' ? err : e.message || '').trim();
  const lower = raw.toLowerCase();
  const code = e.code || '';
  const status = e.status;

  let friendly = '';

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    friendly =
      'Could not reach the server. Check your internet connection and try again. If you were uploading a large image, it may also be too big — try a smaller one.';
  } else if (status === 413 || lower.includes('payload too large') || lower.includes('request entity too large')) {
    friendly = 'The data you tried to save is too large — most likely an image. Use a smaller image and try again.';
  } else if (code === '42501' || lower.includes('row-level security') || lower.includes('permission denied')) {
    friendly =
      'You do not have permission to save this change. Your shop may not be approved/active yet, or your login session may have expired — sign in again and retry.';
  } else if (status === 401 || lower.includes('jwt expired') || lower.includes('invalid jwt') || lower.includes('not authenticated')) {
    friendly = 'Your login session has expired. Please sign in again, then retry.';
  } else if (code === '23505' || lower.includes('duplicate key')) {
    friendly = 'This value is already in use by another record. Change it and try again.';
  } else if (code === '23502' || lower.includes('null value in column')) {
    friendly = 'A required field is empty. Fill in all required fields and try again.';
  } else if (code === '22001' || lower.includes('value too long')) {
    friendly = 'One of the fields is too long. Shorten the text and try again.';
  } else if (code === 'PGRST116' || lower.includes('0 rows')) {
    friendly = 'Nothing was saved because the record could not be found (it may have been removed). Refresh the page and try again.';
  } else if (lower.includes('timeout') || lower.includes('timed out') || status === 504 || status === 408) {
    friendly = 'The server took too long to respond. Try again — if it keeps happening, the image may be too large.';
  } else if (status && status >= 500) {
    friendly = 'The server had a problem saving this. Please try again in a moment.';
  }

  if (friendly) return raw ? `${friendly} [${raw}]` : friendly;
  return raw ? `${fallback} [${raw}]` : fallback;
}
