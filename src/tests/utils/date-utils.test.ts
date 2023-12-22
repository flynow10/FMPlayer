import { fixJsonDateStrings, timeSince } from "@/src/utils/date-utils";

describe("Fix JSON Date Strings", () => {
  it("should handle null values", () => {
    const input = { key: null };
    const output = fixJsonDateStrings(input);
    expect(output).toEqual({ key: null });
  });

  it("should handle arrays", () => {
    const input = { key: [{ createdOn: "2022-01-01" }] };
    const output = fixJsonDateStrings(input);
    expect(output).toEqual({ key: [{ createdOn: new Date("2022-01-01") }] });
  });

  it("should handle nested objects", () => {
    const input = { key: { modifiedOn: "2022-01-01" } };
    const output = fixJsonDateStrings(input);
    expect(output).toEqual({ key: { modifiedOn: new Date("2022-01-01") } });
  });

  it("should convert date strings to Date objects", () => {
    const input = { createdOn: "2022-01-01" };
    const output = fixJsonDateStrings(input);
    expect(output).toEqual({ createdOn: new Date("2022-01-01") });
  });

  it("should not convert non-date strings", () => {
    const input = { key: "not a date" };
    const output = fixJsonDateStrings(input);
    expect(output).toEqual({ key: "not a date" });
  });

  it("should not convert date strings for non-date keys", () => {
    const input = { key: "2022-01-01" };
    const output = fixJsonDateStrings(input);
    expect(output).toEqual({ key: "2022-01-01" });
  });
});

describe("Time Since", () => {
  it("should return seconds", () => {
    const date = new Date(Date.now() - 5000); // 5 seconds ago
    const output = timeSince(date);
    expect(output).toEqual("5 seconds");
  });

  it("should return minutes", () => {
    const date = new Date(Date.now() - 60000 * 5); // 5 minutes ago
    const output = timeSince(date);
    expect(output).toEqual("5 minutes");
  });

  it("should return hours", () => {
    const date = new Date(Date.now() - 3600000 * 5); // 5 hours ago
    const output = timeSince(date);
    expect(output).toEqual("5 hours");
  });

  it("should return days", () => {
    const date = new Date(Date.now() - 86400000 * 5); // 5 days ago
    const output = timeSince(date);
    expect(output).toEqual("5 days");
  });

  it("should return months", () => {
    const date = new Date(Date.now() - 2592000000 * 5); // 5 months ago
    const output = timeSince(date);
    expect(output).toEqual("5 months");
  });

  it("should return years", () => {
    const date = new Date(Date.now() - 31536000000 * 5); // 5 years ago
    const output = timeSince(date);
    expect(output).toEqual("5 years");
  });
});
