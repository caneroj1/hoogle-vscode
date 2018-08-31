var vscode = require("vscode");
var openurl = require("openurl");
var q = require("q");
var _ = require("underscore");

function isUpperCase(str) {
  return str == str.toUpperCase() && str != str.toLowerCase();
}

function isModule(string) {
  return _.includes(string, ".");
}

function exists(o) {
  return !_.isUndefined(o) && !_.isNull(o);
}

function toPackageName(package) {
  return package.toLowerCase();
}

function toValidPackages(packageNames) {
  return _.chain(packageNames)
    .filter(exists)
    .filter(_.isString)
    .reject(_.isEmpty)
    .reject(isModule)
    .map(toPackageName)
    .value();
}

function toPackageString(packageNames) {
  return _.map(packageNames, (package) => `+${package}`).join(" ");
}

function removeHTMLandEntities(text) {
  var htmlTagRegex = /<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi;
  return _.unescape(text.replace(htmlTagRegex, ""))
}

function getCurrentlySelectedText() {
  var activeTextEditor = vscode.window.activeTextEditor;
  if (!activeTextEditor) {
    return;
  }

  var selection = activeTextEditor.selection;
  if (selection.start === selection.end) {
    return;
  }

  var text = activeTextEditor.document.getText(selection);
  return text.trim();
}

function getQuickPickItem(hoogleResultItem) {
  var label = "";
  var description = "";
  var location = hoogleResultItem.location;

  //  if we're displaying a package,
  //  we want to display the package name as the
  //  label, and nothing in the description.
  if (hoogleResultItem.isPackage()) {
    label = hoogleResultItem.getQueryResult();

    //  if we're displaying a module,
    //  we want to display the module name as the
    //  label, and the package name as the description.
  } else if (hoogleResultItem.isModule()) {
    label = hoogleResultItem.getQueryResult();
    description = hoogleResultItem.getPackageName();

    //  otherwise, we're displaying a "real" query result,
    //  so we want to have the label be the module name,
    //  and the description the result
  } else {
    label = hoogleResultItem.getModuleName();
    description = hoogleResultItem.getQueryResult();
  }

  return {
    label: label,
    description: description,
    itemLocation: location
  };
}

function displayHoogleResults(hoogleResults) {
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
exports.removeHTMLandEntities = removeHTMLandEntities;
exports.isModule = isModule;
exports.isUpperCase = isUpperCase;
exports.toValidPackages = toValidPackages;
exports.exists = exists;
exports.toPackageString = toPackageString;