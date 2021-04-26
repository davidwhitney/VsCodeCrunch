# VSCodeCrunch

This is VsCodeCrunch.

A C# continuous test runner for VS Code, heavily inspired by NCrunch and Wallaby.js.

It is paint-dripping-wet-new. There are basically no tests. I promise it'll get better.

Proof of concept.

## Features

* Auto-adds coverlet support to *.csproj files it detects
* Silently uses dotnet watch to watch your supported test projects - if your solution works with dotnet test, it'll work with this.
* Captures and parses test coverage output and renders it into your IDE gutters.

## Requirements

* dotnet command line tools

## Extension Settings

Settings are for wimps.

I mean, there are none yet ;)

## Known Issues

* Project files will have the package `coverlet.collector` added to them. This requirement will be removed in a later release.

## Release Notes


### 0.0.1

This hardly works, but I'm getting it out here for people to play with while I work out where to take this.

-----------------------------------------------------------------------------------------------------------
## Credits

David Whitney, with thanks to Martain Thwaites for initial help and inspiration.