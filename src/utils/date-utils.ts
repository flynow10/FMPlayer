import { Utils } from "@/src/types/utils";

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

export function fixJsonDateStrings<TypeWithDate extends object>(
  input: Utils.ReplaceTypes<TypeWithDate, Date, string>
): TypeWithDate {
  const output: Partial<TypeWithDate> = {};
  (
    Object.entries(input) as Array<
      [
        keyof TypeWithDate,
        Utils.ReplaceTypes<TypeWithDate, Date, string>[keyof TypeWithDate]
      ]
    >
  ).forEach(([key, value]) => {
    if (!value) {
      output[key] = value as TypeWithDate[typeof key];
      return;
    }
    if (Array.isArray(value)) {
      output[key] = value.map((value) =>
        fixJsonDateStrings(value)
      ) as TypeWithDate[typeof key];
      return;
    }
    if (typeof value === "object") {
      output[key] = fixJsonDateStrings<typeof value>(
        value as Utils.ReplaceTypes<typeof value, Date, string>
      ) as TypeWithDate[typeof key];
      return;
    }
    if (typeof value === "string") {
      if (
        typeof key !== "string" ||
        !["modifiedOn", "createdOn"].includes(key)
      ) {
        output[key] = value as TypeWithDate[typeof key];
        return;
      }
      // https://stackoverflow.com/a/14322189
      if (
        value.match(
          /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/
        ) !== null
      ) {
        output[key] = new Date(value) as TypeWithDate[typeof key];
        return;
      }
    }
    output[key] = value as TypeWithDate[typeof key];
  });
  return output as TypeWithDate;
}
