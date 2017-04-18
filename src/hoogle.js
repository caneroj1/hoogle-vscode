var vscode = require("vscode");
var request = require("request");
var qs = require("querystring");

function HoogleRequestConfig() {
  this.maximumResults = 5;
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

function HoogleRequestManager(config = new HoogleRequestConfig(), resultsCallback) {
  let mgr = this;
  mgr.url = "http://www.haskell.org/hoogle/";
  mgr.config = config;
  mgr.resultsCallback = resultsCallback;

  mgr.isValidQuery = function (query) {
    return query && query !== "";
  }

  mgr.formatQuery = function (query) {
    if (query) {
      query = query.trim();
    }
  }

  mgr.getOptions = function (query) {
    return {
      mode: "json",
      count: mgr.config.maximumResults,
      hoogle: query
    };
  }

  mgr.handleResponse = function (err, response, body) {
    if (err) {
      console.error("Hoogle Error", err);
      vscode.window.showErrorMessage("Something went wrong searching Hoogle!");
      vscode.window.showQuickPick()
      return null;
    } else {
      console.info("Unparsed", body);

      var json = JSON.parse(body);
      console.info("Parsed", json);

      var results = new HoogleResults(json);

      console.info("Results", results);
      mgr.resultsCallback(results);
    }
  }

  mgr.search = function (query) {
    mgr.formatQuery(query);
    if (!mgr.isValidQuery(query)) {
      return;
    }

    var opts = mgr.getOptions(query);
    var params = qs.stringify(opts);
    console.info("Hoogle Params", params);

    var requestURL = `${mgr.url}?${params}`;

    console.info("Hoogle Request", requestURL);
    request.get(requestURL, null, mgr.handleResponse);
  }
}

exports.HoogleRequestConfig = HoogleRequestConfig;
exports.HoogleRequestManager = HoogleRequestManager;