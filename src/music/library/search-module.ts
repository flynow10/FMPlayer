import { CRUDObjects } from "@/src/music/library/crud-module";
import { Music } from "@/src/types/music";
import MiniSearch, {
  SearchResult as ParentSearchResult,
  Suggestion,
} from "minisearch";

export type SearchMethods = {
  waitForLoad(): Promise<void>;
  hasNotLoaded(): boolean;
  loadDocuments(type?: DocumentType | ""): Promise<void>;
  suggest(partialSearch: string): Suggestion[];
  (search: string): Promise<SearchResult>;
};

type DocumentType =
  | "track"
  | "album"
  | "playlist"
  | "artist"
  | "tag"
  | "function";

type DocumentList = {
  [Key in DocumentType as `${Key}s`]: Music.DB.TableType<Capitalize<Key>>[];
};

export type SearchResult = DocumentList & {
  search: string;
  results: MiniSearchResult[];
};

type MiniSearchResult = ParentSearchResult & { type: DocumentType };

type MiniSearchDocument = {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
};

/*const STOP_WORD_LIST = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can't",
  "cannot",
  "could",
  "couldn't",
  "did",
  "didn't",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "hadn't",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he'd",
  "he'll",
  "he's",
  "her",
  "here",
  "here's",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "how's",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "if",
  "in",
  "into",
  "is",
  "isn't",
  "it",
  "it's",
  "its",
  "itself",
  "let's",
  "me",
  "more",
  "most",
  "mustn't",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours	ourselves",
  "out",
  "over",
  "own",
  "same",
  "shan't",
  "she",
  "she'd",
  "she'll",
  "she's",
  "should",
  "shouldn't",
  "so",
  "some",
  "such",
  "than",
  "that",
  "that's",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "there's",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "wasn't",
  "we",
  "we'd",
  "we'll",
  "we're",
  "we've",
  "were",
  "weren't",
  "what",
  "what's",
  "when",
  "when's",
  "where",
  "where's",
  "which",
  "while",
  "who",
  "who's",
  "whom",
  "why",
  "why's",
  "with",
  "won't",
  "would",
  "wouldn't",
  "you",
  "you'd",
  "you'll",
  "you're",
  "you've",
  "your",
  "yours",
  "yourself",
  "yourselves",
]); */

export function createSearchMethods(crud: CRUDObjects): SearchMethods {
  const SearchEngine = new MiniSearch<MiniSearchDocument>({
    fields: ["name", "description"],
    storeFields: ["id", "type", "name"],
    searchOptions: {
      fuzzy: 0.2,
      combineWith: "AND",
    },
    // processTerm: (term) => (STOP_WORD_LIST.has(term) ? null : term),
  });

  let isLoading = false;
  let hasLoaded = false;

  let triggerLoaded: () => void;

  const loadingPromise = new Promise<void>((resolve) => {
    triggerLoaded = () => {
      hasLoaded = true;
      resolve();
    };
  });

  const rawDocumentList: DocumentList = {
    albums: [],
    tracks: [],
    playlists: [],
    artists: [],
    tags: [],
    functions: [],
  };

  const searchMethod = async function (search: string): Promise<SearchResult> {
    await waitForLoad();
    const results = SearchEngine.search(search) as MiniSearchResult[];
    const filter = (type: DocumentType) => {
      return (value: { id: string }) => {
        return (
          results.findIndex(
            (result) => result.type === type && result.id === value.id
          ) !== -1
        );
      };
    };
    const filteredDocumentList: DocumentList = {
      albums: rawDocumentList.albums.filter(filter("album")),
      artists: rawDocumentList.artists.filter(filter("artist")),
      playlists: rawDocumentList.playlists.filter(filter("playlist")),
      tags: rawDocumentList.tags.filter(filter("tag")),
      tracks: rawDocumentList.tracks.filter(filter("track")),
      functions: rawDocumentList.functions.filter(filter("function")),
    };
    return {
      search,
      results,
      ...filteredDocumentList,
    };
  };
  const suggest = function (partialSearch: string) {
    return SearchEngine.autoSuggest(partialSearch);
  };

  const loadDocuments = async function (type: DocumentType | "" = "") {
    isLoading = true;
    if (type === "") {
      await Promise.all(
        Object.keys(rawDocumentList).map(async (key) => {
          const docKey = key.slice(0, -1) as DocumentType;
          await loadDocumentType(docKey);
        })
      );
    } else {
      await loadDocumentType(type);
    }
    rebuildIndex();
    triggerLoaded();
    isLoading = false;
  };
  const rebuildIndex = function () {
    SearchEngine.removeAll();
    const documentList: MiniSearchDocument[] = [];
    documentList.push(
      ...rawDocumentList.albums.map<MiniSearchDocument>((album) => ({
        id: album.id,
        name: album.title,
        description: "",
        type: "album",
      }))
    );
    documentList.push(
      ...rawDocumentList.artists.map<MiniSearchDocument>((artist) => ({
        id: artist.id,
        name: artist.name,
        description: "",
        type: "artist",
      }))
    );
    documentList.push(
      ...rawDocumentList.playlists.map<MiniSearchDocument>((playlist) => ({
        id: playlist.id,
        name: playlist.title,
        description: "",
        type: "playlist",
      }))
    );
    documentList.push(
      ...rawDocumentList.tags.map<MiniSearchDocument>((tag) => ({
        id: tag.id,
        name: tag.name,
        description: tag.description ?? "",
        type: "tag",
      }))
    );
    documentList.push(
      ...rawDocumentList.tracks.map<MiniSearchDocument>((track) => ({
        id: track.id,
        name: track.title,
        description: "",
        type: "track",
      }))
    );
    documentList.push(
      ...rawDocumentList.functions.map<MiniSearchDocument>((functionData) => ({
        id: functionData.id,
        name: functionData.title,
        description: "",
        type: "function",
      }))
    );
    SearchEngine.addAll(documentList);
  };

  const loadDocumentType = async function (type: DocumentType) {
    switch (type) {
      case "album": {
        rawDocumentList.albums = await crud.album.list();
        return;
      }
      case "artist": {
        rawDocumentList.artists = await crud.artist.list();
        return;
      }
      case "playlist": {
        rawDocumentList.playlists = await crud.playlist.list();
        return;
      }
      case "tag": {
        rawDocumentList.tags = await crud.tag.list();
        return;
      }
      case "track": {
        rawDocumentList.tracks = await crud.track.list();
        return;
      }
      case "function": {
        rawDocumentList.functions = await crud.function.list();
        return;
      }
    }
  };

  const waitForLoad = () => {
    if (hasNotLoaded()) {
      return loadDocuments();
    }
    return loadingPromise;
  };

  const hasNotLoaded = () => {
    return !isLoading && !hasLoaded;
  };

  const searchObject = Object.assign(searchMethod, {
    loadDocuments,
    waitForLoad,
    hasNotLoaded,
    suggest,
  });

  return searchObject;
}
