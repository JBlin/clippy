function padDateUnit(value: number) {
  return value.toString().padStart(2, '0');
}

function formatDateParts(value: string) {
  const date = new Date(value);

  return {
    year: date.getFullYear(),
    month: padDateUnit(date.getMonth() + 1),
    day: padDateUnit(date.getDate()),
    hour: padDateUnit(date.getHours()),
    minute: padDateUnit(date.getMinutes()),
  };
}

export function formatDateLabel(value: string) {
  const { year, month, day } = formatDateParts(value);
  return `${year}.${month}.${day}`;
}

export function formatCardDateLabel(value: string) {
  return formatDateLabel(value);
}

export function formatDateTimeLabel(value: string) {
  const { year, month, day, hour, minute } = formatDateParts(value);
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

export function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
