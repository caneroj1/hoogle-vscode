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

// Defines a Mocha test suite to group tests of similar kind together
suite("hoogle-vscode tests", function () {

  test("Parsing response: V4", function () {
    var responseV4 = {
      "results": [{
          "location": "http://hackage.haskell.org/packages/archive/base/latest/doc/html/Prelude.html#v:putStr",
          "self": "putStr :: String -> IO ()",
          "docs": "Write a string to the standard output device (same as hPutStr stdout). "
        },
        {
          "location": "http://hackage.haskell.org/packages/archive/base/latest/doc/html/Control-Monad.html#v:join",
          "self": "join :: Monad m => m (m a) -> m a",
          "docs": "The join function is the conventional monad join operator...."
        }
      ],
      "version": "4.2.26"
    };

    var parsedResults = new hoogle.HoogleResults(responseV4);

    assert.equal(2, parsedResults.results.length);

    var item1 = parsedResults.results[0];
    assert.equal("Prelude", item1.getModuleName());
    assert.equal("putStr :: String -> IO ()", item1.getQueryResult());

    var item2 = parsedResults.results[1];
    assert.equal("Control-Monad", item2.getModuleName());
    assert.equal("join :: Monad m => m (m a) -> m a", item2.getQueryResult());
    console.log("here");
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
    ];

    var parsedResults = new hoogle.HoogleResults(responseV5);

    assert.equal(3, parsedResults.results.length);

    var item1 = parsedResults.results[0];
    assert.equal("Prelude", item1.getModuleName());
    assert.equal("putStr :: String -> IO ()", item1.getQueryResult());

    var item2 = parsedResults.results[1];
    assert.equal("Control.Monad", item2.getModuleName());
    assert.equal("join :: (Monad m) => m (m a) -> m a", item2.getQueryResult());

    var item3 = parsedResults.results[2];
    assert.equal("Prelude", item3.getModuleName());
    assert.equal("($) :: (a -> b) -> a -> b", item3.getQueryResult());
  });
});