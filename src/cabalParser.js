var vscode = require("vscode");
var _ = require("underscore");
var childProcess = require("child_process");
var utils = require("./utils");
var defaultPackages = require("./defaultPackages").default;

exports.CabalFileWatcher = function CabalFileWatcher() {
  let me = this;
  me.watcher = null;
  me.dependencies = null;
  me.forcedDependencies = null;
  me.onDidChangeWatcher = null;
  me.onDidDeleteWatcher = null;
  me.onDidCreateWatcher = null;
  me.useCabalDependencies = false;
  me.includeDefaultPackages = true;
  me.defaultPackages = utils.toPackageString(defaultPackages);
  vscode.workspace.onDidChangeConfiguration(setConfigSettings, me);

  function dispose() {
    me.dependencies = null;

    if (me.watcher) {
      me.watcher.dispose();
    }

    if (me.onDidChangeWatcher) {
      me.onDidChangeWatcher.dispose();
    }

    if (me.onDidDeleteWatcher) {
      me.onDidDeleteWatcher.dispose();
    }

    if (me.onDidCreateWatcher) {
      me.onDidCreateWatcher.dispose();
    }

    me.watcher = null;
    me.onDidChangeWatcher = null;
    me.onDidDeleteWatcher = null;
    me.onDidCreateWatcher = null;
  }

  function setConfigSettings() {
    var extSettings = vscode.workspace.getConfiguration("hoogle-vscode");
    me.verbose = extSettings.get("verbose");

    me.includeDefaultPackages = extSettings.get("includeDefaultPackages");

    var configDependencies = extSettings.get("additionalPackages");

    if (me.verbose) {
      console.log("Packages from config: ", configDependencies);
    }

    if (!utils.exists(configDependencies) || !_.isArray(configDependencies) || configDependencies.length === 0) {
      me.forcedDependencies = "";
    } else {
      me.forcedDependencies = utils.toPackageString(utils.toValidPackages(configDependencies));
    }

    if (me.verbose) {
      console.log("Parsed packages from config: ", me.forcedDependencies);
    }

    var newDependencySetting = extSettings.get("useCabalDependencies");
    if (newDependencySetting === me.useCabalDependencies) {
      return;
    }

    if (me.verbose) {
      console.log("Cabal dependency setting changed");
    }

    me.useCabalDependencies = newDependencySetting;
    if (!me.useCabalDependencies) {
      if (me.verbose) {
        console.log("Disposing of CabalFileWatcher resources");
      }
      dispose();
    } else {
      if (me.verbose) {
        console.log("CabalFileWatcher starting file watching");
      }
      startWatching();
      me.getDependenciesFromStack();
    }
  }

  this.getDependenciesFromStack = function () {
    childProcess.exec("stack list-dependencies", {
      input: "",
      cwd: vscode.workspace.rootPath || "."
    }, (err, stdout) => {
      if (err && me.verbose) {
        console.error(err);
      }

      if (stdout) {
        var output = stdout.toString();
        var lines = output.split("\n");
        console.log(lines);
        var packageNames = _.map(lines, (line) => line.split(" ")[0]);
        me.dependencies = utils.toPackageString(utils.toValidPackages(packageNames));
      } else {
        me.dependencies = "";
      }
    });
  }

  this.handleCabalFileChanged = function (uri) {
    if (me.verbose) {
      console.log("cabal file changed event: ", uri);
    }

    me.getDependenciesFromStack();
  }

  function startWatching() {
    let root = vscode.workspace.rootPath || "."
    me.watcher = vscode.workspace.createFileSystemWatcher(`${root}/*.cabal`);
    me.onDidChangeWatcher = me.watcher.onDidChange(me.handleCabalFileChanged, me);
    me.onDidCreateWatcher = me.watcher.onDidCreate(me.handleCabalFileChanged, me);
    me.onDidDeleteWatcher = me.watcher.onDidDelete(() => this.dependencies = []);
  }

  this.getDependencies = function () {
    //  minor optimization here:
    //  -----------------------
    //  if we aren't using dependencies from a .cabal file,
    //  and we aren't using and forced dependency packages,
    //  we don't need to include the default package list
    //  in the query string.
    if (_.isEmpty(me.forcedDependencies) && !me.useCabalDependencies && me.includeDefaultPackages) {
      return "";
    }

    let returnedDependencies = me.forcedDependencies;

    if (me.includeDefaultPackages) {
      returnedDependencies = `${returnedDependencies} ${me.defaultPackages}`;
    }

    if (me.useCabalDependencies) {
      returnedDependencies = `${returnedDependencies} ${me.dependencies}`;
    }

    return _.chain(returnedDependencies.split(" ")).unique().join(" ").value();
  }

  setConfigSettings();
}