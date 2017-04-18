// The module "vscode" contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require("vscode");
var hoogle = require("./src/hoogle");
var utils = require("./src/utils");
var q = require("Q");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  let config = new hoogle.HoogleRequestConfig();
  let manager = new hoogle.HoogleRequestManager(config, utils.displayHoogleResults);

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
        manager.search(text);
      });
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(config);
  context.subscriptions.push(manager);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;