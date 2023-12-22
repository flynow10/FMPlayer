import {
  getFileNameFromUrl,
  isUrl,
  isYoutubeUrl,
  splitOutUrls,
} from "@/src/utils/url-utils";

describe("Is Youtube URL", () => {
  const urls = {
    "https://www.youtube.com/watch?v=H_I-F_RL6Io": "H_I-F_RL6Io",
    "https://youtube.com/watch?v=tC7IZsv5M84": "tC7IZsv5M84",
    "http://www.youtube.com/watch?v=TxfJbu-z_0Q": "TxfJbu-z_0Q",
    "http://youtube.com/watch?v=fJiXLbV_zME": "fJiXLbV_zME",
    ymRPv8AsodA: "ymRPv8AsodA",
    uBQFMbiQO7c: "uBQFMbiQO7c",
    "This is a search": false,
    abandonable: false,
    "https://wagologies.com/games/chess": false,
    "https://youtube.com/watch?v=earlinesses": false,
  };

  for (let i = 0; i < Object.entries(urls).length; i++) {
    const url = Object.entries(urls);
    it(`correctly parses "${url[i][0]}"`, async () => {
      fetchMock.dontMockOnce();
      expect(await isYoutubeUrl(url[i][0])).toBe(url[i][1]);
    });
  }
});

describe("Split out URLs", () => {
  it("should split out multiple URLs from a string", () => {
    const input =
      "Check out https://example.com and http://another.example.com";
    const expected = [
      { type: "string", data: "Check out " },
      { type: "url", data: "https://example.com" },
      { type: "string", data: " and " },
      { type: "url", data: "http://another.example.com" },
    ];
    expect(splitOutUrls(input)).toEqual(expected);
  });

  it("should return an array with a single string object when there are no URLs", () => {
    const input = "This is a string without any URLs.";
    const expected = [{ type: "string", data: input }];
    expect(splitOutUrls(input)).toEqual(expected);
  });

  it("should correctly split out URLs and non-URLs mixed together", () => {
    const input =
      "Visit https://example.com for more information. Feel free to email us at contact@example.com.";
    const expected = [
      { type: "string", data: "Visit " },
      { type: "url", data: "https://example.com" },
      {
        type: "string",
        data: " for more information. Feel free to email us at contact@example.com.",
      },
    ];
    expect(splitOutUrls(input)).toEqual(expected);
  });
});

describe("Is URL", () => {
  it("should return true for valid URLs", () => {
    const validUrls = [
      "https://www.google.com",
      "http://example.com",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "ftp://ftp.example.com",
      "http://localhost:3000",
    ];

    for (const url of validUrls) {
      expect(isUrl(url)).toBe(true);
    }
  });

  it("should return false for invalid URLs", () => {
    const invalidUrls = [
      "not a url",
      "http//missing.colon.com",
      "missing.protocol.com",
    ];

    for (const url of invalidUrls) {
      expect(isUrl(url)).toBe(false);
    }
  });
});

describe("Get file name from URL", () => {
  it("should return the filename for valid URLs", () => {
    const urls = [
      { url: "https://example.com/path/to/file.txt", expected: "file" },
      { url: "http://localhost:3000/path/to/file.txt", expected: "file" },
      { url: "ftp://ftp.example.com/path/to/file.txt", expected: "file" },
    ];

    for (const { url, expected } of urls) {
      expect(getFileNameFromUrl(url)).toBe(expected);
    }
  });

  it("should decode encoded characters in the filename", () => {
    const urls = [
      {
        url: "https://example.com/path/to/file%20name.txt",
        expected: "file name",
      },
      {
        url: "http://localhost:3000/path/to/file%20name.txt",
        expected: "file name",
      },
      {
        url: "ftp://ftp.example.com/path/to/file%20name.txt",
        expected: "file name",
      },
    ];

    for (const { url, expected } of urls) {
      expect(getFileNameFromUrl(url)).toBe(expected);
    }
  });

  it("should return undefined for URLs without a filename", () => {
    const urls = [
      "https://example.com/path/to/",
      "http://localhost:3000/path/to/",
      "ftp://ftp.example.com/path/to/",
    ];

    for (const url of urls) {
      expect(getFileNameFromUrl(url)).toBeUndefined();
    }
  });
});
