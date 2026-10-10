
const COLOMBIA_TIME_ZONE = 'America/Bogota';

const colombiaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: COLOMBIA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const colombiaTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: COLOMBIA_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function getColombiaDate(date: Date): string {
  const parts = colombiaDateFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function getColombiaMinutes(date: Date): number {
  const parts = colombiaTimeFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return Number(values.hour) * 60 + Number(values.minute);
}
