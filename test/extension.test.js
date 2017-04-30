/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module "assert" provides assertion methods from node
var assert = require("assert");

// You can import and use all API from the "vscode" module
// as well as import your extension to test it
var vscode = require("vscode");
var myExtension = require("../extension");
var hoogle = require("../src/hoogle");
var utils = require("../src/utils");

// Defines a Mocha test suite to group tests of similar kind together
suite("hoogle-vscode tests", function () {

  test("Validating lists of package names", function () {
    //  we lowercase words that appear to be package names
    let list1 = [
      "Cabal",
      "HUnit",
      "array"
    ];

    assert.deepEqual(utils.toValidPackages(list1), [
      "cabal",
      "hunit",
      "array"
    ]);

    //  remove words that appear to be modules
    let list2 = [
      "Data.Aeson",
      "Control.Monad",
      "base"
    ];

    assert.deepEqual(utils.toValidPackages(list2), [
      "base"
    ]);

    //  remove bad input
    let list3 = [
      "",
      undefined,
      null,
      1, [
        4,
        5,
        "7"
      ],
      "base"
    ];

    assert.deepEqual(utils.toValidPackages(list3), [
      "base"
    ]);
  });

  test("Parsing response: V4", function () {
    var responseV4 = {
      "results": [{
          "location": "http://hackage.haskell.org/packages/archive/base/latest/doc/html/Prelude.html#v:putStr",
          "self": "putStr :: String -> IO ()",
          "docs": "..."
        },
        {
          "location": "http://hackage.haskell.org/packages/archive/base/latest/doc/html/Control-Monad.html#v:join",
          "self": "join :: Monad m => m (m a) -> m a",
          "docs": "..."
        },
        {
          "location": "http://hackage.haskell.org/package/join",
          "self": "package join",
          "docs": "..."
        },
        {
          "location": "http://hackage.haskell.org/packages/archive/base/latest/doc/html/Control-Monad.html",
          "self": "module Control.Monad",
          "docs": "..."
        }
      ],
      "version": "4.2.26"
    };

    var parsedResults = new hoogle.HoogleResults(responseV4);

    assert.equal(4, parsedResults.results.length);

    var item1 = parsedResults.results[0];
    assert.equal("Prelude", item1.getModuleName());
    assert.equal("putStr :: String -> IO ()", item1.getQueryResult());
    assert.equal(false, item1.isModule());

    var item2 = parsedResults.results[1];
    assert.equal("Control-Monad", item2.getModuleName());
    assert.equal("join :: Monad m => m (m a) -> m a", item2.getQueryResult());
    assert.equal(false, item1.isModule());

    var item3 = parsedResults.results[2];
    assert.equal("package join", item3.getQueryResult());
    assert.equal(false, item3.isModule());
    assert.equal(true, item3.isPackage());

    var item4 = parsedResults.results[3];
    assert.equal("module Control.Monad", item4.getQueryResult());
    assert.equal("package base", item4.getPackageName());
    assert.equal(true, item4.isModule());
    assert.equal(false, item4.isPackage());
  });

  test("Parsing response: V5", function () {
    var responseV5 = [{
        "url": "https://hackage.haskell.org/package/base/docs/Prelude.html#v:putStr",
        "module": {
          "url": "https://hackage.haskell.org/package/base/docs/Prelude.html",
          "name": "Prelude"
        },
        "package": {
          "url": "https://hackage.haskell.org/package/base",
          "name": "base"
        },
        "item": "<span class=name><0>putStr</0></span> :: String -&gt; IO ()",
        "type": "",
        "docs": "..."
      },
      {
        "url": "https://hackage.haskell.org/package/base/docs/Control-Monad.html#v:join",
        "module": {
          "url": "https://hackage.haskell.org/package/base/docs/Control-Monad.html",
          "name": "Control.Monad"
        },
        "package": {
          "url": "https://hackage.haskell.org/package/base",
          "name": "base"
        },
        "item": "<span class=name><0>join</0></span> :: (Monad m) =&gt; m (m a) -&gt; m a",
        "type": "",
        "docs": "..."
      },
      {
        "url": "https://hackage.haskell.org/package/base/docs/Prelude.html#v:-36-",
        "module": {
          "url": "https://hackage.haskell.org/package/base/docs/Prelude.html",
          "name": "Prelude"
        },
        "package": {
          "url": "https://hackage.haskell.org/package/base",
          "name": "base"
        },
        "item": "<span class=name>(<0>$</0>)</span> :: (a -&gt; b) -&gt; a -&gt; b",
        "type": "",
        "docs": "..."
      },
      {
        "url": "https://hackage.haskell.org/package/base/docs/Control-Monad.html",
        "module": {},
        "package": {
          "url": "https://hackage.haskell.org/package/base",
          "name": "base"
        },
        "item": "<b>module</b> Control.<span class=name><0>Monad</0></span>",
        "type": "module",
        "docs": "..."
      },
      {
        "url": "https://hackage.haskell.org/package/base",
        "module": {},
        "package": {},
        "item": "<b>package</b> <span class=name><0>base</0></span>",
        "type": "package",
        "docs": "..."
      }
    ];

    var parsedResults = new hoogle.HoogleResults(responseV5);

    assert.equal(5, parsedResults.results.length);

    var item1 = parsedResults.results[0];
    assert.equal("Prelude", item1.getModuleName());
    assert.equal("putStr :: String -> IO ()", item1.getQueryResult());

    var item2 = parsedResults.results[1];
    assert.equal("Control.Monad", item2.getModuleName());
    assert.equal("join :: (Monad m) => m (m a) -> m a", item2.getQueryResult());

    var item3 = parsedResults.results[2];
    assert.equal("Prelude", item3.getModuleName());
    assert.equal("($) :: (a -> b) -> a -> b", item3.getQueryResult());

    var item4 = parsedResults.results[3];
    assert.equal("module Control.Monad", item4.getQueryResult());
    assert.equal("package base", item4.getPackageName());
    assert.equal(true, item4.isModule());
    assert.equal(false, item4.isPackage());

    var item5 = parsedResults.results[4];
    assert.equal("package base", item5.getQueryResult());
    assert.equal(false, item5.isModule());
    assert.equal(true, item5.isPackage());
  });
});