var vscode = require("vscode");
var openurl = require("openurl");
var q = require("q");

function getCurrentlySelectedText() {
  var activeTextEditor = vscode.window.activeTextEditor;
  if (!activeTextEditor) {
    return;
  }

  var selection = activeTextEditor.selection;
  var text = activeTextEditor.document.getText(selection);
  return text.trim();
}

function getQuickPickItem(hoogleResultItem) {
  var packageName = hoogleResultItem.getPackageName();
  var functionAndTypeSig = hoogleResultItem.self;

  return {
    label: packageName,
    description: functionAndTypeSig,
    itemLocation: hoogleResultItem.location
  };
}

function displayHoogleResults(hoogleResults) {
  console.log(hoogleResults);

  var quickPickList = [];
  var results = hoogleResults.results;
  for (var i = 0; i < results.length; i++) {
    quickPickList.push(getQuickPickItem(results[i]));
  }

  vscode.window.showQuickPick(quickPickList)
    .then((item) => {
      if (item) {
        openurl.open(item.itemLocation);
      }
    });
}

function getTextFromInput() {
  var deferred = q.defer();
  vscode.window.showInputBox({
    prompt: "Enter Hoogle search query",
    placeHolder: "a -> b"
  }).then((text) => {
    deferred.resolve(text);
  });
  return deferred.promise;
}

exports.displayHoogleResults = displayHoogleResults;
exports.getQuickPickItem = getQuickPickItem;
exports.getCurrentlySelectedText = getCurrentlySelectedText;
exports.getTextFromInput = getTextFromInput;