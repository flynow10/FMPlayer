import {
  levenshteinDistance,
  pickSuggestions,
  shortenNumberString,
  slugify,
} from "@/src/utils/string-utils";

describe("Levenshtein Distance", () => {
  it("should calculate the correct distance", () => {
    expect(levenshteinDistance("kitten", "sitting")).toBe(3);
    expect(levenshteinDistance("book", "back")).toBe(2);
    expect(levenshteinDistance("book", "book")).toBe(0);
    expect(levenshteinDistance("book", "")).toBe(4);
    expect(levenshteinDistance("", "")).toBe(0);
  });
});

describe("Pick Suggestions", () => {
  it("should return the correct number of suggestions", () => {
    const searchSpace = [
      "apple",
      "banana",
      "cherry",
      "date",
      "elderberry",
      "fig",
      "grape",
      "honeydew",
      "ice cream",
      "jackfruit",
    ];
    const suggestions = pickSuggestions("a", searchSpace, 5);
    expect(suggestions.length).toBe(5);
  });

  it("should return suggestions sorted by Levenshtein distance", () => {
    const searchSpace = ["apple", "apricot", "avocado", "banana", "cherry"];
    const suggestions = pickSuggestions("ap", searchSpace);
    expect(suggestions).toEqual([
      "apple",
      "apricot",
      "avocado",
      "banana",
      "cherry",
    ]);
  });

  it("should return all suggestions if the number of suggestions is greater than the search space size", () => {
    const searchSpace = ["apple", "banana", "cherry"];
    const suggestions = pickSuggestions("a", searchSpace, 10);
    expect(suggestions).toEqual(["apple", "banana", "cherry"]);
  });

  it("should return an empty array if the search space is empty", () => {
    const searchSpace: string[] = [];
    const suggestions = pickSuggestions("a", searchSpace);
    expect(suggestions).toEqual([]);
  });

  it("should return an empty array if the search string is empty", () => {
    const searchSpace = ["apple", "banana", "cherry"];
    const suggestions = pickSuggestions("", searchSpace);
    expect(suggestions).toEqual([]);
  });
});

describe("Shorten Number String", () => {
  it("should shorten numbers correctly without trailing decimals", () => {
    expect(shortenNumberString(1234567890)).toBe("1.23B");
    expect(shortenNumberString(123456789)).toBe("123.46M");
    expect(shortenNumberString(123456)).toBe("123.46K");
    expect(shortenNumberString(1234)).toBe("1.23K");
    expect(shortenNumberString(123)).toBe("123");
  });

  it("should shorten numbers correctly with maxTrailingDecimal", () => {
    expect(shortenNumberString(1234567890, 1)).toBe("1.2B");
    expect(shortenNumberString(123456789, 1)).toBe("123.5M");
    expect(shortenNumberString(123456, 1)).toBe("123.5K");
    expect(shortenNumberString(1234, 1)).toBe("1.2K");
    expect(shortenNumberString(123, 1)).toBe("123");
  });

  it("should shorten numbers correctly with requiredTrailingDecimals", () => {
    expect(shortenNumberString(1234567890, undefined, 2)).toBe("1.23B");
    expect(shortenNumberString(123456789, undefined, 2)).toBe("123.46M");
    expect(shortenNumberString(123456, undefined, 2)).toBe("123.46K");
    expect(shortenNumberString(1234, undefined, 2)).toBe("1.23K");
    expect(shortenNumberString(123, undefined, 2)).toBe("123.00");
  });

  it("should shorten numbers correctly with both maxTrailingDecimal and requiredTrailingDecimals", () => {
    expect(shortenNumberString(1234567890, 1, 2)).toBe("1.20B");
    expect(shortenNumberString(123456789, 1, 2)).toBe("123.50M");
    expect(shortenNumberString(123456, 1, 2)).toBe("123.50K");
    expect(shortenNumberString(1234, 1, 2)).toBe("1.20K");
    expect(shortenNumberString(123, 1, 2)).toBe("123.00");
  });

  it("should handle string inputs", () => {
    expect(shortenNumberString("1234567890")).toBe("1.23B");
    expect(shortenNumberString("123456789")).toBe("123.46M");
    expect(shortenNumberString("123456")).toBe("123.46K");
    expect(shortenNumberString("1234")).toBe("1.23K");
    expect(shortenNumberString("123")).toBe("123");
  });
});

describe("Slugify", () => {
  it("should slugify strings correctly", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("Test String")).toBe("test-string");
    expect(slugify("Another Test String")).toBe("another-test-string");
  });

  it("should slugify numbers correctly", () => {
    expect(slugify(123)).toBe("123");
    expect(slugify(123, 456)).toBe("123-456");
  });

  it("should slugify mixed strings and numbers correctly", () => {
    expect(slugify("Hello", 123)).toBe("hello-123");
    expect(slugify(123, "Hello")).toBe("123-hello");
  });

  it("should handle special characters correctly", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("Test/String")).toBe("teststring");
  });

  it("should handle accented characters correctly", () => {
    expect(slugify("Héllo Wórld")).toBe("hello-world");
    expect(slugify("Tést Stríng")).toBe("test-string");
  });

  it("should handle multiple spaces correctly", () => {
    expect(slugify("Hello  World")).toBe("hello-world");
    expect(slugify("Test  String")).toBe("test-string");
  });

  it("should handle leading and trailing spaces correctly", () => {
    expect(slugify(" Hello World ")).toBe("hello-world");
    expect(slugify(" Test String ")).toBe("test-string");
  });
});
