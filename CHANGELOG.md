# Change Log

## [0.0.7]
* Fix incorrect keybinding listed in the [readme](https://github.com/caneroj1/hoogle-vscode#readme) for [#6](https://github.com/caneroj1/hoogle-vscode/issues/6).

## [0.0.6]
* Merge pull request [#4](https://github.com/caneroj1/hoogle-vscode/pull/4). Expose hoogle search functionality via a public API. Thanks to [EduardSergeev](https://github.com/EduardSergeev)!

## [0.0.5]
* Address [#3](https://github.com/caneroj1/hoogle-vscode/issues/3). Slow startup time was caused by asking stack to enumerate our the dependencies in a workspace. Convert that to an asynchronous call.
* Merge pull request [#5](https://github.com/caneroj1/hoogle-vscode/pull/5). Prevent duplicate search results. Thanks to [EduardSergeev](https://github.com/EduardSergeev)!

## [0.0.4]
Added new configuration options:
* `hoogle-vscode.useCabalDependencies`: read a .cabal file in your workspace to get the list of dependencies for queries to Hoogle. *NOTE: this requires `stack` to be installed and available on your PATH*
* `hoogle-vscode.additionalPackages`: a list of packages that will always be passed to Hoogle.
* `hoogle-vscode.includeDefaultPackages`: include the Hoogle v4 default packages in your query.

*NOTE:* Due to differences between [Hoogle V4](http://www.haskell.org/hoogle/) and [Hoogle V5](http://hoogle.haskell.org), these configuration settings may be unnecessary when querying a V5 server.
* If you change your `hoogle-vscode.url` to point to a V5 server, you can probably ignore the `hoogle-vscode.useCabalDependencies`, `hoogle-vscode.additionalPackages`, and `hoogle-vscode.includeDefaultPackages` settings and leave them at the defaults.
* If you are pointing to a V4 server, those settings are probably are more relevant. See the [Recommended Settings](https://github.com/caneroj1/hoogle-vscode#recommended-settings) section.


## [0.0.3]
- Add configuration setting to change the Hoogle url.

## [0.0.2]
- Fix [#1](https://github.com/caneroj1/hoogle-vscode/issues/1)
- Add keybindings to search command

## [0.0.1]
- Initial release
