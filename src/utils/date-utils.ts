import { Duration, parse } from "iso8601-duration";

// https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

export function formatIsoDuration(isoDuration: string) {
  const duration = parse(isoDuration);
  const formatOrder: (keyof Duration)[] = [
    "days",
    "hours",
    "minutes",
    "seconds",
  ];

  const formattedStringParts: string[] = [];

  for (let i = 0; i < formatOrder.length; i++) {
    const format = formatOrder[i];
    let formatValue = duration[format];
    if (formatValue) {
      formatValue = Math.round(formatValue);
      let valueString = formatValue.toString();
      if (formattedStringParts.length !== 0) {
        while (valueString.length < 2) {
          valueString = "0" + valueString;
        }
      }
      formattedStringParts.push(valueString);
    }
  }

  return formattedStringParts.join(":");
}
