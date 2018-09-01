// The module "vscode" contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require("vscode");
var hoogle = require("./src/hoogle");
var utils = require("./src/utils");
var q = require("q");
var cabal = require("./src/cabalParser");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  let manager = new hoogle.HoogleRequestManager();
  let cabalFileWatcher = new cabal.CabalFileWatcher();

  var disposable = vscode.commands.registerCommand("extension.hoogle", function () {
    var deferred = q.defer();
    var promise = null;

    var text = utils.getCurrentlySelectedText();
    if (!text || text === "") {
      promise = utils.getTextFromInput();
    } else {
      deferred.resolve(text);
      promise = deferred.promise;
    }

    promise
      .then((text) => {
        let config = new hoogle.HoogleRequestConfig(text, utils.displayHoogleResults);
        let deps = cabalFileWatcher.getDependencies();
        manager.search(config, deps);
      });
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(manager);
  context.subscriptions.push(cabalFileWatcher);

  /**
   * Export `search` method as extension public API
   * Other extensions can use this method as following:
   * ```javascript
   * let hoogle = vscode.extensions.getExtension('jcanero.hoogle-vscode');
   * let hoogleApi = hoogle.exports;
   * let hoogleSearch = hoogleApi.search;
   * ```
   */
  let api = {
    /**
     * Results callback
     * 
     * @callback resultsCallback
     * @param {HoogleResultItemV4 | HoogleResultItemV5} hoogleResults
     */
    /**
     * Runs Hoogle search calling `resultsCallback` with results
     * 
     * @param {string} query Hoogle request 
     * @param {resultsCallback} resultsCallback Results handler
     */
    search(query, resultsCallback) {
      let config = new hoogle.HoogleRequestConfig(query, resultsCallback);
      let deps = cabalFileWatcher.getDependencies();
      manager.search(config, deps);
    }
  };
  return api;
}
exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;