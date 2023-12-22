import {
  delimitedIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
  LRLanguage,
} from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";
import { parser } from "./fm-parser";

const parserWithMetaData = parser.configure({
  props: [
    styleTags({
      Identifier: t.variableName,
      Number: t.number,
      MediaId: t.string,
      "Loop End": t.keyword,
      "PlayTrack PlayTrackList Variable": t.definitionKeyword,
      "GetAlbum GetPlaylist GetFunction": t.function(t.propertyName),
      "GetTrack GetTrackFromList": t.typeName,
      "( )": t.paren,
      "; :": t.separator,
    }),
    indentNodeProp.add({
      Block: delimitedIndent({ closing: "End", align: false }),
    }),
    foldNodeProp.add({
      Block: foldInside,
    }),
  ],
});
export const FMLanguage = LRLanguage.define({
  parser: parserWithMetaData,
  name: "FM",
});
