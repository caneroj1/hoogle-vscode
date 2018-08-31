var vscode = require("vscode");
var request = require("request");
var qs = require("querystring");
var utils = require("./utils");
var _ = require("underscore");

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
  this.isModuleType = false;
  this.isPackageType = false;

  //  v4 results don't have "type" identifiers in the response, so we'll have to parse
  //  some information out manually.

  //  check if it's a module result
  if (this.result.includes("module ")) {
    this.isModuleType = true;
  } else if (this.result.includes("package ")) {
    this.isPackageType = true;
  }

  this.isModule = function () {
    return this.isModuleType;
  }

  this.isPackage = function () {
    return this.isPackageType;
  }

  this.getPackageName = function () {
    if (this.isPackageType) {
      return this.result;
    }

    var splitComponents = this.location.split("/");

    //  get the package name from the URL. :(
    var index = _.findIndex(splitComponents, function (item) {
      return item === "archive";
    });

    //  there is no "archive" component in the URL,
    //  so check if there is a "package" component
    if (index === -1) {
      index = _.findIndex(splitComponents, function (item) {
        return item === "package";
      });
    }

    if (index === -1) {
      return "Unknown Package";
    } else {
      if (splitComponents[index + 1]) {
        return "package " + splitComponents[index + 1]
      }

      return "Unknown Package";
    }
  }

  this.getModuleName = function () {
    if (this.isModuleType) {
      return this.result.replace("module ", "");
    }

    var splitComponents = this.location.split("/");

    if (splitComponents.length < 1) {
      return "Unknown Module";
    }

    var last = splitComponents[splitComponents.length - 1];

    var splitOnOctothorpe = last.split("#");

    if (splitOnOctothorpe.length === 0) {
      return "Unknown Module"
    }

    var packageWithHTML = splitOnOctothorpe[0];
    var packageName = packageWithHTML.replace(".html", "");
    return packageName;
  }

  this.getQueryResult = function () {
    return this.result;
  }
}

function HoogleResultItemV5(url, mod, package, item, doc, type) {
  this.location = url;
  this.module = mod;
  this.package = package;
  this.result = utils.removeHTMLandEntities(item);
  this.docs = doc;
  this.type = type;

  this.isModule = function () {
    return this.type === "module";
  }

  this.isPackage = function () {
    return this.type === "package";
  }

  this.getModuleName = function () {
    if (this.module && this.module.name) {
      return this.module.name;
    }

    return "Unknown Module";
  }

  this.getPackageName = function () {
    if (this.package && this.package.name) {
      return "package " + this.package.name;
    }

    return "Unknown Package";
  }

  this.getQueryResult = function () {
    return this.result;
  }
}

function HoogleResults(json = {}, count = 5) {
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
        var type = resultItem.type;

        if (!url || !result) {
          vscode.window.showErrorMessage("Unknown response format from Hoogle!");
        } else {
          this.results.push(new HoogleResultItemV5(url, resultItem.module, resultItem.package, result, docs, type));
        }
      }, this);
    } else {
      vscode.window.showErrorMessage("Unknown response format from Hoogle!");
    }
  }

  this.results = _.take(this.results, count);
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

  mgr.getOptions = function (hoogleConfig, packageDependencies = "") {
    let query = `${packageDependencies} ${hoogleConfig.query}`

    return {
      mode: "json",
      count: hoogleConfig.maxResults,
      hoogle: query
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

        var results = new HoogleResults(json, hoogleConfig.maxResults);

        if (hoogleConfig.verbose) {
          console.info("Results", results);
        }
        hoogleConfig.resultsCallback(results);
      }
    }
  }

  mgr.search = function (hoogleConfig, deps) {
    mgr.formatQuery(hoogleConfig);
    if (!mgr.isValidQuery(hoogleConfig)) {
      return;
    }

    var opts = mgr.getOptions(hoogleConfig, deps);
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