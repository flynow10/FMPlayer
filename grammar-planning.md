## What I want to be able to do

- Play a song
- Play a series of songs
- Shuffle / Change the order of playback for a list of songs
- Play a group of songs a variable amount of times
- Play a song conditionally based on:
  - A loop index
  - Function input
  - World variables (date, time, weather, etc...)
  - Random
  - Properties of the song (duration, number of times played, date added, title, tags)
- Play another function

## What a function might look like

When displayed on the screen this would be in a drag and drop block form.

```
1.  Play Tracks (<trackId>)
2.  Play Tracks (Get Playlist (<playlistId>))
3.  Begin Loop (Get World Variable ("day of the week")) (index)
4.    Define Variable (list, Get Playlist (<playlistId>));
5.    If (index < 3) Then
6.      Play Tracks (Get Track From List(list, Random(Get Track List Property (list, "length"))))
7.    End
8.    If (index > 3) Then
9.      If (index < 5) Then
10.       Play Tracks (<trackId>)
11.     Else
12.       Play Tracks (<trackId>)
13.     End
14.   End
15.   Play Tracks (list)
16. End
17. Play Tracks (Get Function (<functionId>, (4 + 3) * 2))
```

## Informal Grammar

<!-- JS language is used for syntax highlighting -->

Key:

```js
| = "Alternation"
() = "Group"
+ = "1 or more of previous"
* = "0 or more of previous"
? = "Optional previous"
"" = "String literal / Token"
  "<something here>" = "Regex / UUID"
```

Grammar:

```js
Block:
  (Statement)+

Statement:
  PlayTracks
  | DefineVariable
  | BeginLoop
  | If
  | End
  | Else

PlayTracks:
  "Play Tracks (" (TrackExpression | TrackListExpression | MediaId) ")"

MediaId:
  "<mediaId>"

TrackExpression:
  Identifier
  | GetTrackFromList
  | GetTrack

TrackListExpression:
  Identifier
  | GetPlaylist
  | GetAlbum
  | GetFunction

Identifier:
  "<[a-Z0-9_]+>"

GetPlaylist:
  "Get Playlist (" (MediaId) ")"

GetFunction:
  "Get Function (" (MediaId) ("," (NumberExpression))* ")"

GetAlbum:
  "Get Album (" (MediaId) ")"

GetTrack:
  "Get Track (" (MediaId) ")"

GetTrackFromList:
  "Get Track From List (" (TrackListExpression) "," (NumberExpression) ")"

NumberExpression:
  NumberTerm
  | (NumberTerm) "+" (NumberTerm)
  | (NumberTerm) "-" (NumberTerm)

NumberTerm:
  NumberFactor
  | (NumberTerm) "*" (NumberTerm)
  | (NumberTerm) "/" (NumberTerm)
  | (NumberTerm) "%" (NumberTerm)

NumberFactor:
  NumberLiteral
  | Identifier
  | NumberStatement
  | "(" (NumberExpression) ")"

NumberStatement:
  Random
  | GetWorldVariable
  | GetInput
  | GetTrackProperty
  | GetTrackListProperty

Random:
  "Random (" (NumberExpression) ("," (NumberExpression))? ")"

GetWorldVariable:
  "Get World Variable(" (WorldVariable) ")"

WorldVariable:
  "<worldVariable>" // Ex: Date, Time, Weather, etc ...

GetInput:
  "Get Input (" (NumberExpression) ")"

GetTrackProperty:
  "Get Track Property (" (TrackExpression) "," (TrackProperty) ")"

TrackProperty:
  "<trackProperty>" // Ex: Duration, Artist Count, Date Created, Integrated Loudness, etc...

GetTrackListProperty:
  "Get Track List Property (" (TrackListExpression) "," (TrackListProperty) ")"

TrackListProperty:
  "<trackListProperty>" // Ex: Length, Integrated Loudness, Date Created

NumberLiteral:
  "<(-)?[0-9]+>"

DefineVariable:
  "Define Variable (" (Identifier) "," (TrackExpression | TrackListExpression | NumberExpression) ")"

BeginLoop:
  "Begin Loop (" (NumberExpression) ") (" (Identifier) ")" (Block) (End)

If:
  "If (" (Condition) ") Then" (Block) (Else | End)

Condition:
  (NumberExpression) (BooleanOperator) (NumberExpression)

BooleanOperator:
  "="
  | "<"
  | ">"
  | "<="
  | ">="
  | "!="

End:
  "End"

Else:
  "Else" (Block) (End)
```

## Other Considerations

Currently this grammar does not include any ability to manipulate, store, compare, or use strings in any way. This means that titles, artists, tags, etc... are not a returnable properties and cannot be conditionally acted apon.

To make strings useful, the ability to index, split, substring, compare, and store would need to be added. Doing this would mean a major increase in complexity for the language as well as greater chances for runtime errors. <span style="color: gray;">(no one wants to spend time debugging their music)</span>

At the moment, there are no plans to add strings as a data type.
