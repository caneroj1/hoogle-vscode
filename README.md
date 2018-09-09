# hoogle-vscode

[![Build status](https://ci.appveyor.com/api/projects/status/0m2jfw2lfl3kb200?svg=true)](https://ci.appveyor.com/project/caneroj1/hoogle-vscode) [![Build Status](https://travis-ci.org/caneroj1/hoogle-vscode.svg?branch=master)](https://travis-ci.org/caneroj1/hoogle-vscode)

Extension for Visual Studio Code to search Hoogle, the Haskell search engine.

Available for download in the [marketplace](https://marketplace.visualstudio.com/items?itemName=jcanero.hoogle-vscode).

*NOTE:* Due to differences between [Hoogle V4](http://www.haskell.org/hoogle/) and [Hoogle V5](http://hoogle.haskell.org), including package names in your query seems to be unnecessary.
* If you change your `hoogle-vscode.url` to point to a V5 server, I think you can ignore the `hoogle-vscode.useCabalDependencies`, `hoogle-vscode.additionalPackages`, and `hoogle-vscode.includeDefaultPackages` settings.
* If you are pointing to a V4 server, those settings are probably a bit more relevant. See the [Recommended Settings](#recommended-settings) section.

## Features

1. Press `shift` + `alt`+ `h`, or open the `Command Palette` and select `Hoogle Search`, then type your query to get results.
2. Select some text, press `shift` + `alt`+ `h`, or open the `Command Palette` and select `Hoogle Search`, and get results based off of the selected text.
3. Selecting a result in the dropdown will bring you to Hackage to see the found result in more detail.
4. Can be configured to use a local Hoogle server.
5. Can be configured to read from (and watch) a .cabal file in your workspace to use those packages in all queries.
6. Supports manually adding additional packages to the search query as part of workspace/user settings. []

## Extension Settings

This extension contributes the following settings:

* `hoogle-vscode.maxResults`: Default is `5`. Maximum number of Hoogle results to display.
* `hoogle-vscode.verbose`: Default is `false`. Enable verbose logging to the console (for debugging).
* `hoogle-vscode.url`: Default is `http://www.haskell.org/hoogle/`. Change the url of Hoogle. This can point to a local Hoogle server.
* `hoogle-vscode.useCabalDependencies`: Default is `false`. If set to `true`, the extension will read a .cabal file in your workspace to get the list of dependencies. That list of dependencies will be used to constraint your search queries. This will also start watching your .cabal file for changes. *NOTE: this requires `stack` to be installed and available on your PATH*.
* `hoogle-vscode.additionalPackages`: Default is `[]`. You can add a list of packages here that will always be used to constrain the search query.
* `hoogle-vscode.includeDefaultPackages`: Default is `true`. When true, this will include the Hoogle default packages in your query. That way, if you set `hoogle-vscode.additionalPackages` to `true`, your query will search all of those packages. When set to `false`, the extension won't include those packages in your query.

## Recommended Settings

* If you are okay with having Hoogle search its default set of packages, but you always want to include a few more in the query, specify those packages in `hoogle-vscode.additionalPackages` and leave `hoogle-vscode.includeDefaultPackages` at the default setting.
* If you are working on a `stack` project, you can set `hoogle-vscode.useCabalDependencies` to true and turn off `hoogle-vscode.includeDefaultPackages` so that Hoogle will search only in the packages you are using in your project. `hoogle-vscode.additionalPackages` can be specified if you want to search other packages not in your .cabal file.

## Release Notes

### 1.0.0

Soon to come...