import { isYoutubeUrl } from "@/src/utils/UrlUtils";

describe("isYoutubeUrl", () => {
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
    test(`Test url: ${url[i][0]}`, async () => {
      fetchMock.dontMockOnce();
      expect(await isYoutubeUrl(url[i][0])).toBe(url[i][1]);
    });
  }
});
