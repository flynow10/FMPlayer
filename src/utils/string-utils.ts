const cache: { [key: string]: number } = {};

export function levenshteinDistance(a: string, b: string): number {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const key = a + "," + b;

  if (cache[key] !== undefined) {
    return cache[key];
  }

  let result = 0;

  if (b.length === 0) {
    result = a.length;
  } else if (a.length === 0) {
    result = b.length;
  } else if (a[0] === b[0]) {
    result = levenshteinDistance(a.substring(1), b.substring(1));
  } else {
    result =
      1 +
      Math.min(
        levenshteinDistance(a.substring(1), b),
        levenshteinDistance(a, b.substring(1)),
        levenshteinDistance(a.substring(1), b.substring(1))
      );
  }

  cache[key] = result;
  return result;
}

export function pickSuggestions(
  search: string,
  searchSpace: string[],
  suggestionCount = 8
): string[] {
  function calculateScore(strings: string[], search: string) {
    return Math.min(
      ...strings.map((str) => {
        return levenshteinDistance(
          str.substring(0, Math.min(str.length, search.length)),
          search.substring(0)
        );
      })
    );
  }

  return searchSpace
    .map((str) => ({ str, spaced: str.split(" ") }))
    .sort((a, b) => {
      const aBaseScore = calculateScore(a.spaced, search),
        bBaseScore = calculateScore(b.spaced, search);

      if (aBaseScore !== bBaseScore) {
        return aBaseScore - bBaseScore;
      }

      return calculateScore([a.str], search) - calculateScore([b.str], search);
    })
    .map((strObj) => strObj.str)
    .slice(0, suggestionCount);
}

export function shortenNumberString(
  number: number | string,
  maxTrailingDecimal?: number,
  requiredTrailingDecimals?: number
) {
  number = Number(number);
  let rounded = 0;
  let abbr = "";

  if (number >= 1e12) {
    abbr = "T";
    rounded = number / 1e12;
  } else if (number >= 1e9) {
    abbr = "B";
    rounded = number / 1e9;
  } else if (number >= 1e6) {
    abbr = "M";
    rounded = number / 1e6;
  } else if (number >= 1e3) {
    abbr = "K";
    rounded = number / 1e3;
  } else {
    rounded = number;
  }

  let roundedString = "" + rounded;

  if (maxTrailingDecimal !== undefined) {
    const test = new RegExp(`\\.\\d{${maxTrailingDecimal + 1},}$`);
    if (test.test("" + rounded)) {
      roundedString = rounded.toFixed(maxTrailingDecimal);
    }
  }
  if (requiredTrailingDecimals !== undefined) {
    roundedString = Number(roundedString).toFixed(requiredTrailingDecimals);
  }

  return roundedString + abbr;
}

export const slugify = (...args: (string | number)[]): string => {
  const value = args.join(" ");

  return value
    .normalize("NFD") // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "") // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, "-"); // separator
};
