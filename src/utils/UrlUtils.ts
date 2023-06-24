export async function isYoutubeUrl(
  searchString: string
): Promise<string | boolean> {
  let videoId;
  if (isUrl(searchString)) {
    const url = new URL(searchString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const match = searchString.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w-]{10,12})\b/
    );
    if (match === null) return false;
    videoId = match[1];
  } else {
    if (searchString.match(/^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/) === null) {
      return false;
    }
    videoId = searchString;
  }
  const videoExists = (
    await fetch(
      `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`
    ).catch(() => {
      return { ok: false };
    })
  ).ok;
  if (videoExists) {
    return videoId;
  }
  return false;
}

type URLSplitObject = { type: "url" | "string"; data: string };
export function splitOutUrls(text: string): URLSplitObject[] {
  const url_pattern =
    /(?:https?:\/\/.)(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
  const urls = text.match(url_pattern) || [];
  const non_urls = text.split(url_pattern);
  const output: URLSplitObject[] = [];
  for (let i = 0; i < non_urls.length; i++) {
    output.push({ type: "string", data: non_urls[i] });
    if (i < urls.length) {
      const url = urls[i];
      if (isUrl(url)) {
        output.push({ type: "url", data: url });
      } else {
        output.push({ type: "string", data: url });
      }
    }
  }
  return output;
}

export function isUrl(url: string) {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
}
