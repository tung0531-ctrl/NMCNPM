export function formatUTCToLocal(dateString: string, locale = 'vi-VN', options?: Intl.DateTimeFormatOptions) {
  if (!dateString) return '';

  // If incoming string looks like 'YYYY-MM-DD HH:MM:SS' (MySQL), convert to ISO-like UTC by replacing space
  // and appending 'Z' so Date parses it as UTC. If it's already ISO with timezone, leave it.
  let s = dateString;

  // Detect common MySQL datetime format without timezone (YYYY-MM-DD HH:MM:SS)
  const mysqlLike = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (mysqlLike.test(s)) {
    s = s.replace(' ', 'T') + 'Z';
  }

  // Detect date-only format (YYYY-MM-DD) and treat as start of day UTC
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnly.test(s)) {
    s = s + 'T00:00:00Z';
  }

  // If it looks like ISO without timezone designator, append Z
  const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
  if (isoLike.test(s)) {
    s = s + 'Z';
  }

  const date = new Date(s);
  const fmtOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(options || {})
  };

  return date.toLocaleString(locale, fmtOptions);
}
