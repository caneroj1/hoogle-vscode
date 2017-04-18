var vscode = require("vscode");
var request = require("request");
var qs = require("querystring");

function HoogleRequestConfig(query, resultsCallback) {
  var extSettings = vscode.workspace.getConfiguration("hoogle-vscode");
  this.maxResults = extSettings.get("maxResults");
  this.resultsCallback = resultsCallback;
  this.verbose = extSettings.get("verbose");
  this.query = query;
}

function HoogleResultItem(location = "", self = "", docs = "") {
  this.location = location;
  this.self = self;
  this.docs = docs;

  this.getPackageName = function () {
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
}

function HoogleResults(json = {}) {
  var tmpResults = json.results || [];
  this.results = []
  this.version = json.version || "N/A";

  for (var i = 0; i < tmpResults.length; i++) {
    var item = tmpResults[i];
    this.results.push(new HoogleResultItem(item.location, item.self, item.docs));
  }
}

function HoogleRequestManager() {
  let mgr = this;
  mgr.url = "http://www.haskell.org/hoogle/";

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

    var requestURL = `${mgr.url}?${params}`;

    if (hoogleConfig.verbose) {
      console.info("Hoogle Request", requestURL);
    }
    request.get(requestURL, null, mgr.handleResponse(hoogleConfig));
  }
}

exports.HoogleRequestConfig = HoogleRequestConfig;
exports.HoogleRequestManager = HoogleRequestManager;