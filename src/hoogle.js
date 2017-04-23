var vscode = require("vscode");
var request = require("request");
var qs = require("querystring");
var utils = require("./utils");

function HoogleRequestConfig(query, resultsCallback) {
  var extSettings = vscode.workspace.getConfiguration("hoogle-vscode");

  this.maxResults = extSettings.get("maxResults");
  this.url = extSettings.get("url");
  this.verbose = extSettings.get("verbose");

  this.resultsCallback = resultsCallback;
  this.query = query;
}

function HoogleResultItemV4(location = "", result = "", docs = "") {
  this.location = location;
  this.result = result;
  this.docs = docs;

  this.getModuleName = function () {
    var splitComponents = this.location.split("/");

    if (splitComponents.length < 1) {
      return "Unknown Package";
    }

    var last = splitComponents[splitComponents.length - 1];

    var splitOnOctothorpe = last.split("#");

    if (splitOnOctothorpe.length === 0) {
      return "Unknown Package"
    }

    var packageWithHTML = splitOnOctothorpe[0];
    var packageName = packageWithHTML.replace(".html", "");
    return packageName;
  }

  this.getQueryResult = function () {
    return this.result;
  }
}

function HoogleResultItemV5(url, moduleName, item, docs) {
  this.location = url;
  this.module = moduleName;
  this.result = utils.removeHTMLandEntities(item);
  this.docs = docs;

  this.getModuleName = function () {
    return this.module;
  }

  this.getQueryResult = function () {
    return this.result;
  }
}

function HoogleResults(json = {}) {
  this.results = []

  //  try and see if the response has a version.
  //  if it does, and it's V4, then parse the results
  //  using the V4 type.
  if (json.version) {
    var versionNumbers = json.version.split(".");
    var major = versionNumbers[0];

    if (major === "4" && json.results) {
      for (var i = 0; i < json.results.length; i++) {
        var item = json.results[i];
        this.results.push(new HoogleResultItemV4(item.location, item.self, item.docs));
      }
    } else {
      vscode.window.showErrorMessage("Unknown response format from Hoogle!");
    }
  }
  //  otherwise, try and parse the result using
  //  the version 5 format.
  else {
    if (Array.isArray(json)) {
      json.forEach(function (resultItem) {
        var url = resultItem.url;
        var docs = resultItem.docs;
        var result = resultItem.item;

        var moduleName = null;
        if (resultItem.module) {
          var moduleName = resultItem.module.name;
        }

        if (!url || !result || !moduleName) {
          vscode.window.showErrorMessage("Unknown response format from Hoogle!");
        } else {
          this.results.push(new HoogleResultItemV5(url, moduleName, result, docs));
        }
      }, this);
    } else {
      vscode.window.showErrorMessage("Unknown response format from Hoogle!");
    }
  }
}

function HoogleRequestManager() {
  let mgr = this;

  mgr.isValidQuery = function (hoogleConfig) {
    return hoogleConfig.query && hoogleConfig.query !== "";
  }

  mgr.formatQuery = function (hoogleConfig) {
    if (hoogleConfig.query) {
      hoogleConfig.query = hoogleConfig.query.trim();
    }
  }

  mgr.getOptions = function (hoogleConfig) {
    return {
      mode: "json",
      count: hoogleConfig.maxResults,
      hoogle: hoogleConfig.query
    };
  }

  mgr.handleResponse = function (hoogleConfig) {
    return function (err, response, body) {
      if (err) {
        console.error("Hoogle Error", err);
        vscode.window.showErrorMessage("Something went wrong searching Hoogle!");
        return null;
      } else {
        if (hoogleConfig.verbose) {
          console.info("Unparsed", body);
        }

        var json = JSON.parse(body);

        if (hoogleConfig.verbose) {
          console.info("Parsed", json);
        }

        var results = new HoogleResults(json);

        if (hoogleConfig.verbose) {
          console.info("Results", results);
        }
        hoogleConfig.resultsCallback(results);
      }
    }
  }

  mgr.search = function (hoogleConfig) {
    mgr.formatQuery(hoogleConfig);
    if (!mgr.isValidQuery(hoogleConfig)) {
      return;
    }

    var opts = mgr.getOptions(hoogleConfig);
    var params = qs.stringify(opts);

    if (hoogleConfig.verbose) {
      console.info("Hoogle Params", params);
    }

    var requestURL = `${hoogleConfig.url}?${params}`;

    if (hoogleConfig.verbose) {
      console.info("Hoogle Request", requestURL);
    }
    request.get(requestURL, null, mgr.handleResponse(hoogleConfig));
  }
}

exports.HoogleRequestConfig = HoogleRequestConfig;
exports.HoogleRequestManager = HoogleRequestManager;
exports.HoogleResults = HoogleResults;